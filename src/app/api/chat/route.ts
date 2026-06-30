/**
 * POST /api/chat — Credit Speed Assistant free-text fallback.
 * Provider-agnostic: tries Groq (Llama 3.3 70B) → Gemini Flash → graceful capture.
 * Keys are server-only. Scripted quick-replies in the widget handle most turns;
 * this route is only hit for free text.
 */
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, HELPLINE } from "@/lib/chat-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_MSG_LEN = 500;
const MAX_HISTORY = 8;
const DAILY_CAP = 40; // best-effort per-IP soft cap (per warm instance)

// Best-effort in-memory cap. Serverless instances aren't shared, so this is a
// soft guard, not a hard limit — upgrade to Upstash/Redis if abuse appears.
const hits = new Map<string, { n: number; day: string }>();
function overCap(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const cur = hits.get(ip);
  if (!cur || cur.day !== day) { hits.set(ip, { n: 1, day }); return false; }
  cur.n += 1;
  return cur.n > DAILY_CAP;
}

const FALLBACK = `Sorry, I couldn't process that right now. Please call or WhatsApp us at ${HELPLINE} and our team will help you directly.`;

async function tryGroq(messages: Msg[]): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 400,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.choices?.[0]?.message?.content?.trim() || null;
  } catch { return null; }
}

async function tryGemini(messages: Msg[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
        }),
      }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch { return null; }
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (overCap(ip)) {
    return NextResponse.json(
      { reply: `You've hit today's chat limit. Please call/WhatsApp us at ${HELPLINE}.`, capped: true },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const raw: unknown = body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // Sanitize: keep last N, cap length, only user/assistant roles.
  const messages: Msg[] = raw
    .filter((m): m is Msg =>
      m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MSG_LEN) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "last message must be from user" }, { status: 400 });
  }

  const reply = (await tryGroq(messages)) || (await tryGemini(messages));
  if (!reply) return NextResponse.json({ reply: FALLBACK, fallback: true });
  return NextResponse.json({ reply });
}
