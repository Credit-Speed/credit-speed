/**
 * Regenerates src/data/partner-shops.json from the Credit Speed database.
 *
 * The marketing site deliberately has NO database connection. The retailers
 * table holds PAN, Aadhaar numbers and bank details, so giving a public site
 * any read path to it — even a narrowed one — is a standing risk for a page
 * that changes roughly weekly. A snapshot committed to the repo keeps the
 * store pages fully static and leaves the database unreachable from the web.
 *
 * Only ever copies fields that are safe in public: shop name, city, locality
 * and PIN. Never phone, never address lines, never owner details.
 *
 * Run from the credit-speed-insurance directory, which holds the keys:
 *   set -a && . .env.local && set +a
 *   node ../finkist/scripts/sync-partner-shops.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const res = await fetch(
  `${url}/rest/v1/retailers?select=shop_name,city,locality,pin_code,status,onboarding_status&limit=2000`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
if (!res.ok) {
  console.error("Fetch failed:", res.status, (await res.text()).slice(0, 200));
  process.exit(1);
}

const title = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|\s|-)([a-z])/g, (_, p, c) => p + c.toUpperCase());

const rows = await res.json();
const shops = rows
  // Live partners only: a shop still in the approval queue is not somewhere
  // we can send a customer.
  .filter(
    (r) =>
      r.status === "enabled" &&
      (r.onboarding_status === "approved" || r.onboarding_status === null)
  )
  .filter((r) => (r.shop_name || "").trim() && (r.city || "").trim())
  .map((r) => ({
    name: title(r.shop_name),
    city: title(r.city),
    locality: (r.locality || "").trim() ? title(r.locality) : null,
    pin: /^\d{6}$/.test(String(r.pin_code || "").trim())
      ? String(r.pin_code).trim()
      : null,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const out = {
  generated_at: new Date().toISOString().slice(0, 10),
  count: shops.length,
  shops,
};

const here = dirname(fileURLToPath(import.meta.url));
const dest = join(here, "..", "src", "data", "partner-shops.json");
writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");

const byCity = {};
shops.forEach((s) => (byCity[s.city] = (byCity[s.city] || 0) + 1));
console.log(`wrote ${shops.length} shops ->`, dest);
console.log("by city:", byCity);
