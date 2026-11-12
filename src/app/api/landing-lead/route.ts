/**
 * POST /api/landing-lead — the form on creditspeed.in/start.
 *
 * Order matters: own page → JSON, small → the rules → the database, which
 * does the per-visitor limit, the repeat check, the save and the audit entry
 * in one transaction (submit_lead_public, migration 025).
 *
 * The answer never says whether a number was already a lead: a repeat and a
 * new lead both come back as { ok: true }. Otherwise this would be a way to
 * ask "has this person enquired about a loan?" one number at a time.
 */
import { NextResponse } from "next/server";
import { parseLandingLead } from "@/lib/lead-intake";
import { outcomeResponse, readLeadRequest, submitLead } from "@/lib/lead-intake-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const read = await readLeadRequest(req);
  if (!read.ok)
    return NextResponse.json({ ok: false, error: read.error }, { status: read.status, headers: NO_STORE });

  const parsed = parseLandingLead(read.body);
  if (!parsed.ok)
    return NextResponse.json(
      { ok: false, code: "invalid", field: parsed.field, error: parsed.error },
      { status: 400, headers: NO_STORE },
    );

  // A script filled the hidden field. Say thank you and save nothing, so it
  // has no reason to try something cleverer. Logged, without personal data,
  // so that if real visitors ever trip it the count shows it.
  if (parsed.honeypot) {
    console.warn("[landing-lead] hidden field filled; discarded as automated");
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const { status, body } = outcomeResponse(await submitLead(parsed.lead, "landing", req));
  return NextResponse.json(body, { status, headers: NO_STORE });
}
