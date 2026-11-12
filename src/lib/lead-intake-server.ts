/**
 * Website leads — the server half: the intake key, the visitor hash and the
 * one call that saves a lead. Imported by API routes only; never by a
 * component, so nothing here can end up in the browser bundle.
 *
 * The marketing site holds no service-role key, on purpose. It holds the
 * public key plus LEAD_INTAKE_KEY, which opens exactly one thing: the
 * submit_lead_public() database function (credit-speed-team migration 025).
 * That function does the limiting, the repeat check and the audit entry in
 * a single transaction.
 */
import { createHmac } from "node:crypto";
import { fromOwnPage, ipBucket, type PublicLead } from "./lead-intake";

/** created and duplicate look the same to the visitor: "we have your details". */
export type IntakeOutcome = "saved" | "rate_limited" | "busy" | "unavailable";

/** Generous: the assistant sends the last two chat messages as the note. */
const MAX_BODY_BYTES = 16 * 1024;

/** The key migration 025 issues: exactly 64 lowercase hex characters. */
const KEY_SHAPE = /^[0-9a-f]{64}$/;

export type ReadResult =
  | { ok: true; body: unknown }
  | { ok: false; status: number; error: string };

/** Same-origin, JSON, small. Everything a lead route checks before parsing. */
export async function readLeadRequest(req: Request): Promise<ReadResult> {
  const h = req.headers;
  if (
    !fromOwnPage({
      origin: h.get("origin"),
      host: h.get("host"),
      forwardedHost: h.get("x-forwarded-host"),
      secFetchSite: h.get("sec-fetch-site"),
    })
  )
    return { ok: false, status: 403, error: "Forbidden" };

  if (!(h.get("content-type") ?? "").toLowerCase().startsWith("application/json"))
    return { ok: false, status: 415, error: "Send JSON." };

  const declaredRaw = h.get("content-length");
  if (declaredRaw !== null) {
    const declared = Number(declaredRaw);
    if (!Number.isFinite(declared) || declared < 0) return { ok: false, status: 400, error: "Invalid request." };
    if (declared > MAX_BODY_BYTES) return { ok: false, status: 413, error: "Request too large." };
  }

  // Count bytes as they arrive and stop reading past the limit, whatever the
  // header claimed.
  const bytes = await readCapped(req, MAX_BODY_BYTES);
  if (bytes === "too_large") return { ok: false, status: 413, error: "Request too large." };
  if (bytes === "error") return { ok: false, status: 400, error: "Invalid request." };

  try {
    return { ok: true, body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, status: 400, error: "Invalid request." };
  }
}

async function readCapped(req: Request, limit: number): Promise<Uint8Array | "too_large" | "error"> {
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const parts: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel().catch(() => {});
        return "too_large";
      }
      parts.push(value);
    }
  } catch {
    return "error";
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.byteLength;
  }
  return out;
}

/**
 * The visitor's address as Vercel reports it. Vercel sets these itself and
 * overwrites anything the client sent, so on production they cannot be forged.
 */
function visitorIp(req: Request): string {
  return ipBucket(req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for"));
}

/**
 * Save a lead. Never throws, never returns anything about the lead itself.
 * Logs carry the outcome and the database error code — no name, no number.
 */
export async function submitLead(
  lead: PublicLead,
  source: "landing" | "chatbot",
  req: Request,
): Promise<IntakeOutcome> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Trimmed: a key pasted into Vercel with a trailing space or newline would
  // otherwise be refused by the database with no obvious cause.
  const key = process.env.LEAD_INTAKE_KEY?.trim();
  if (!url || !anon || !key || !KEY_SHAPE.test(key)) {
    console.error(
      "[lead-intake] FATAL: not configured — LEAD_INTAKE_KEY is missing or is not the 64-character key from migration 025, or the Supabase settings are missing. No lead can be saved.",
    );
    return "unavailable";
  }

  // Keyed, so the stored value cannot be turned back into an address by
  // anyone who does not hold the key. The address itself is never stored.
  const ipHash = createHmac("sha256", key).update(`ip:${visitorIp(req)}`).digest("hex");

  let res: Response;
  try {
    res = await fetch(`${url}/rest/v1/rpc/submit_lead_public`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_key: key,
        p_lead_type: lead.lead_type,
        p_phone: lead.phone,
        p_name: lead.name,
        p_city: lead.city,
        p_shop_name: lead.shop_name,
        p_intent: lead.intent,
        p_source: source,
        p_campaign: lead.campaign,
        p_ip_hash: ipHash,
        p_consent: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error("[lead-intake] database unreachable:", e instanceof Error ? e.name : "error");
    return "unavailable";
  }

  if (!res.ok) {
    // PostgREST puts the Postgres error code in `code`. The message can echo
    // input, so only the code is logged.
    const code = await res
      .json()
      .then((j: unknown) => (j && typeof j === "object" && "code" in j ? String((j as { code: unknown }).code) : "?"))
      .catch(() => "?");
    console.error(`[lead-intake] save failed: http ${res.status}, code ${code}`);
    return "unavailable";
  }

  const outcome = await res
    .json()
    .then((j: unknown) => (j && typeof j === "object" && "outcome" in j ? String((j as { outcome: unknown }).outcome) : ""))
    .catch(() => "");

  switch (outcome) {
    case "created":
    case "duplicate":
      return "saved";
    case "rate_limited":
      // No personal data: the first characters of the keyed hash are enough
      // to see whether one address is being refused again and again.
      console.warn(`[lead-intake] per-visitor limit reached (visitor ${ipHash.slice(0, 8)})`);
      return "rate_limited";
    case "busy":
      console.error("[lead-intake] site-wide hourly ceiling reached — visitors are being sent to WhatsApp.");
      return "busy";
    case "denied":
      console.error("[lead-intake] FATAL: the database refused LEAD_INTAKE_KEY. The key in Vercel does not match the one issued by migration 025. No lead can be saved.");
      return "unavailable";
    default:
      console.error("[lead-intake] FATAL: unexpected answer from submit_lead_public.");
      return "unavailable";
  }
}

/** The JSON answer for each outcome, shared by both lead routes. */
export function outcomeResponse(outcome: IntakeOutcome): { status: number; body: Record<string, unknown> } {
  switch (outcome) {
    case "saved":
      return { status: 200, body: { ok: true } };
    case "rate_limited":
      return { status: 429, body: { ok: false, code: "rate_limited", error: "Too many attempts. Please try again in a little while." } };
    case "busy":
      return { status: 503, body: { ok: false, code: "busy", error: "We are getting a lot of enquiries right now. Please WhatsApp us instead." } };
    default:
      return { status: 503, body: { ok: false, code: "unavailable", error: "Could not save right now. Please WhatsApp us instead." } };
  }
}
