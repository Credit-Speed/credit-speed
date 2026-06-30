/**
 * POST /api/lead — capture a chatbot lead into the shared Supabase `leads` table.
 * Uses the PUBLIC anon key only (RLS allows anon INSERT-only on scoped columns).
 * Consent is required (DPDP). No service-role key on the marketing site.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  const b = await req.json().catch(() => ({}));
  const lead_type = b?.lead_type === "retailer" ? "retailer" : "customer";
  const phone = onlyDigits(String(b?.phone || ""));
  const consent = b?.consent === true;

  if (phone.length < 10) {
    return NextResponse.json({ ok: false, error: "A valid phone number is required." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ ok: false, error: "Consent is required to save your details." }, { status: 400 });
  }

  const row = {
    lead_type,
    name: b?.name ? String(b.name).slice(0, 120) : null,
    phone: phone.slice(-10),
    city: b?.city ? String(b.city).slice(0, 80) : null,
    shop_name: b?.shop_name ? String(b.shop_name).slice(0, 120) : null,
    source: "chatbot",
    intent: b?.intent ? String(b.intent).slice(0, 500) : null,
    consent_at: new Date().toISOString(),
  };

  try {
    const r = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: "Could not save. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Network error. Please try again." }, { status: 502 });
  }
}
