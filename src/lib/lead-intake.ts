/**
 * Website leads — the rules for what a visitor may send us.
 *
 * Pure functions: no database, no secrets, no Node-only imports, so the form
 * (which only uses the option lists) and the API routes (which enforce the
 * rules) can share them. The routes are the authority; nothing is trusted
 * because the browser already checked it.
 *
 * What we deliberately never take here: Aadhaar, PAN, GSTIN, bank details.
 * A lead is a name, a city and a phone number someone asked us to call.
 */

export const BUYING_OPTIONS = [
  { value: "week", hi: "इसी हफ़्ते", en: "This week", note: "buying this week" },
  { value: "month", hi: "इस महीने", en: "This month", note: "buying this month" },
  { value: "later", hi: "बाद में", en: "Later", note: "buying later" },
] as const;
export type Buying = (typeof BUYING_OPTIONS)[number]["value"];

export type LeadType = "customer" | "retailer";

/** "Which phone do you want?" on the landing page. */
export const WANTS_MAX = 150;

/** What the database function receives, minus the key and the visitor hash. */
export type PublicLead = {
  lead_type: LeadType;
  phone: string;
  name: string | null;
  city: string | null;
  shop_name: string | null;
  intent: string | null;
  campaign: string | null;
};

export type LeadField = "who" | "name" | "city" | "shop_name" | "phone" | "consent" | "has_gst";

export type ParseResult =
  | { ok: true; lead: PublicLead; honeypot: boolean }
  | { ok: false; field: LeadField | null; error: string };

/** "0612-2345678", "080 23456789": a trunk 0, an STD code, a separator, a subscriber number. */
const LOOKS_LIKE_LANDLINE = /^\s*0\d{2,4}[\s-]\d{6,8}\s*$/;

/**
 * Indian mobile number → its bare 10 digits, or null.
 * Accepts "+91 98765 43210", "098765-43210", "919876543210". Must start 6–9.
 * A wrong number means a telecaller rings a stranger, so anything written the
 * way a landline is written is refused.
 */
export function normaliseIndianMobile(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const text = String(raw);
  if (text.length > 24 || LOOKS_LIKE_LANDLINE.test(text)) return null;
  let d = text.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

/** Trim, drop control characters, collapse whitespace, cap the length. */
export function cleanText(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const s = raw
    .slice(0, max * 4)
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    // A cut can land inside an emoji and leave half of it, which the database
    // refuses as text. With the u flag this matches only unpaired halves.
    .replace(/[\uD800-\uDFFF]/gu, "")
    .trim();
  return s || null;
}

/** Runs of ten or more digits, allowing one space, hyphen or dot between digits. */
const DIGIT_RUN = /\d(?:[ .-]?\d){9,}/g;
/** A PAN: five letters, four digits, one letter. */
const PAN = /\b[A-Za-z]{5}\d{4}[A-Za-z]\b/g;

/**
 * Blank out anything in free text that looks like an Aadhaar or PAN number,
 * or a phone number. We never collect those at lead stage, and people do
 * type them into "anything else?" boxes. A price or a price range
 * ("10000-15000") is left alone: a 10-digit run is treated as a phone only
 * when it starts 6-9, as an Indian mobile does.
 */
export function maskIdentifiers(text: string): string {
  return text
    .replace(DIGIT_RUN, (run) => {
      const d = run.replace(/\D/g, "");
      const sensitive =
        (d.length === 10 && /^[6-9]/.test(d)) || (d.length === 11 && d.startsWith("0")) || d.length >= 12;
      return sensitive ? "[number removed]" : run;
    })
    .replace(PAN, "[number removed]");
}

/**
 * The ad a visitor came from: `?src=ig-emi`. It ends up in front of staff and
 * in the audit log, so it is held to lowercase letters, digits and hyphens —
 * anything else is dropped, not cleaned up.
 */
export function cleanCampaign(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  return /^[a-z0-9-]{1,32}$/.test(s) ? s : null;
}

/** Letters and the vowel signs that ride on them, in any script. Built from a
 *  string because the build target predates \p{…} in regex literals. */
const LETTERISH = new RegExp("[\\p{L}\\p{M}]", "gu");

/** A name or a place has at least two letter-marks in it. */
function hasLetters(s: string | null): s is string {
  return !!s && (s.match(LETTERISH)?.length ?? 0) >= 2;
}

/**
 * The landing page form. `who` picks the branch:
 *   customer — wants a call about price and EMI. `buying` and `wants` (which
 *              phone, in their words) are optional.
 *   shop     — owns a mobile shop and has said they hold a GST registration.
 *              A shop owner without GST is turned away by the page and never
 *              reaches the server; if one arrives anyway it is refused here.
 * The note staff read (`intent`) is assembled from these fixed choices plus
 * `wants`, the only free text from the visitor: capped at 150 characters,
 * cleaned, and with anything like an Aadhaar, PAN or phone number blanked.
 */
export function parseLandingLead(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { ok: false, field: null, error: "Invalid request." };
  const b = body as Record<string, unknown>;

  // A field no person can see. Anything in it was typed by a script. Its
  // name matches nothing a browser or password manager would autofill.
  const honeypot = typeof b.hp_extra === "string" && b.hp_extra.trim() !== "";

  if (b.who !== "customer" && b.who !== "shop")
    return { ok: false, field: "who", error: "Choose whether you want a phone or own a shop." };
  const isShop = b.who === "shop";

  if (isShop && b.has_gst !== true)
    return { ok: false, field: "has_gst", error: "A GST registration is needed to become a partner shop." };

  const shop_name = isShop ? cleanText(b.shop_name, 120) : null;
  if (isShop && !hasLetters(shop_name))
    return { ok: false, field: "shop_name", error: "Enter your shop's name." };

  const name = cleanText(b.name, 120);
  if (!hasLetters(name)) return { ok: false, field: "name", error: "Enter your name." };

  const city = cleanText(b.city, 80);
  if (!hasLetters(city)) return { ok: false, field: "city", error: "Enter your city." };

  const phone = normaliseIndianMobile(b.phone);
  if (!phone) return { ok: false, field: "phone", error: "Enter a valid 10-digit mobile number." };

  if (b.consent !== true)
    return { ok: false, field: "consent", error: "Please tick the box so our team may call you." };

  const campaign = cleanCampaign(b.src);
  const buying = BUYING_OPTIONS.find((o) => o.value === b.buying);
  const wantsRaw = isShop ? null : cleanText(b.wants, WANTS_MAX);
  const wants = wantsRaw ? maskIdentifiers(wantsRaw) : null;
  const parts = isShop
    ? ["Landing page", "shop owner, says they have GST", "wants to become a partner shop"]
    : [
        "Landing page",
        "wants a call about phone price and EMI",
        ...(buying ? [buying.note] : []),
        ...(wants ? [`wants: ${wants}`] : []),
      ];
  if (campaign) parts.push(`ad: ${campaign}`);

  return {
    ok: true,
    honeypot,
    lead: {
      lead_type: isShop ? "retailer" : "customer",
      phone,
      name,
      city,
      shop_name,
      intent: parts.join(" · "),
      campaign,
    },
  };
}

/**
 * The website assistant's form (ChatWidget) and the shop page. Older shape:
 * `lead_type`, optional name and city, and a free-text note of what was asked.
 */
export function parseAssistantLead(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { ok: false, field: null, error: "Invalid request." };
  const b = body as Record<string, unknown>;

  const phone = normaliseIndianMobile(b.phone);
  if (!phone) return { ok: false, field: "phone", error: "A valid 10-digit mobile number is required." };
  if (b.consent !== true)
    return { ok: false, field: "consent", error: "Consent is required to save your details." };

  const lead_type: LeadType = b.lead_type === "retailer" ? "retailer" : "customer";
  return {
    ok: true,
    honeypot: false,
    lead: {
      lead_type,
      phone,
      name: cleanText(b.name, 120),
      city: cleanText(b.city, 80),
      shop_name: lead_type === "retailer" ? cleanText(b.shop_name, 120) : null,
      intent: (() => {
        const t = cleanText(b.intent, 500);
        return t ? maskIdentifiers(t) : null;
      })(),
      campaign: null,
    },
  };
}

/**
 * One bucket per visitor for the rate limit. IPv4 as it is. IPv6 cut to its
 * /64: a single phone or home line is handed a whole /64 and can change the
 * rest at will, so counting full addresses would count nothing.
 */
export function ipBucket(raw: string | null | undefined): string {
  const v = (raw ?? "").split(",")[0].trim().toLowerCase().replace(/%.*$/, "");
  if (!v || v.length > 64) return "unknown";
  const mapped = v.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return mapped[1];
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(v)) return v;
  if (!/^[0-9a-f:]+$/.test(v) || !v.includes(":")) return "unknown";

  const halves = v.split("::");
  if (halves.length > 2) return "unknown";
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const groups =
    halves.length === 2
      ? [...head, ...Array(Math.max(0, 8 - head.length - tail.length)).fill("0"), ...tail]
      : head;
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return "unknown";
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

/**
 * Did one of our own pages send this? A lead form has no session to steal,
 * so this is not a CSRF defence — it stops other websites from using a
 * visitor's browser to post leads through ours. A script that is not a
 * browser can forge these headers; the rate limit is what holds that.
 */
export function fromOwnPage(h: {
  origin: string | null;
  host: string | null;
  forwardedHost: string | null;
  secFetchSite: string | null;
}): boolean {
  const site = h.secFetchSite?.toLowerCase();
  if (site && site !== "same-origin") return false;
  if (!h.origin) return true;
  let originHost: string;
  try {
    originHost = new URL(h.origin).host.toLowerCase();
  } catch {
    return false; // includes the literal "null" a sandboxed frame sends
  }
  return [h.forwardedHost, h.host]
    .filter((x): x is string => !!x)
    .map((x) => x.split(",")[0].trim().toLowerCase())
    .includes(originHost);
}
