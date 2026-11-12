/**
 * POST /api/lead — the website assistant's "leave your details" form, and the
 * shop page's enquiry form.
 *
 * Goes through the same keyed, rate-limited database function as the landing
 * page (submit_lead_public, migration 025) and is recorded as `chatbot`.
 * It used to insert into `leads` directly with the public key, which anyone
 * could also do from outside, without limit; migration 026 closes that.
 * Consent is required (DPDP). No service-role key on the marketing site.
 */
import { NextResponse } from "next/server";
import { parseAssistantLead } from "@/lib/lead-intake";
import { outcomeResponse, readLeadRequest, submitLead } from "@/lib/lead-intake-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const read = await readLeadRequest(req);
  if (!read.ok)
    return NextResponse.json({ ok: false, error: read.error }, { status: read.status, headers: NO_STORE });

  const parsed = parseAssistantLead(read.body);
  if (!parsed.ok)
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400, headers: NO_STORE });

  const { status, body } = outcomeResponse(await submitLead(parsed.lead, "chatbot", req));
  return NextResponse.json(body, { status, headers: NO_STORE });
}
