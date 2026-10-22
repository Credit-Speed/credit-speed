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
  `${url}/rest/v1/retailers?select=id,shop_name,city,locality,pin_code,oroboro_code,status,onboarding_status&limit=2000`,
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

// Coordinates come from beat visits — the point where a field officer stood
// when they logged a visit to that shop. That is a better source than
// geocoding our stored addresses, which are landmark-style ("Near bachpan
// school") and would geocode to the wrong place. A wrong pin sends a
// customer to the wrong shop, which is worse than no pin at all.
const visitRes = await fetch(
  `${url}/rest/v1/beat_visits?select=retailer_id,lat,lng&limit=5000`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);
const visits = visitRes.ok ? await visitRes.json() : [];

// Kanpur and the districts we actually operate in. Two visits in the data
// were logged from Patna, 500km away; plotting those would put a partner
// shop in another state.
const IN_RANGE = (lat, lng) =>
  lat > 25.9 && lat < 27.1 && lng > 79.6 && lng < 81.2;

const coords = new Map();
for (const v of visits) {
  if (!v.retailer_id || v.lat == null || v.lng == null) continue;
  const lat = Number(v.lat), lng = Number(v.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  if (!IN_RANGE(lat, lng)) continue;
  // Most recent visit wins; the row order from the API is good enough here.
  coords.set(v.retailer_id, { lat, lng });
}
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
    id: String(r.id),
    name: title(r.shop_name),
    city: title(r.city),
    locality: (r.locality || "").trim() ? title(r.locality) : null,
    pin: /^\d{6}$/.test(String(r.pin_code || "").trim())
      ? String(r.pin_code).trim()
      : null,
    // An Oroboro code is what makes a merchant able to actually originate a
    // loan. A shop without one cannot help a customer who walks in, so it is
    // never plotted on the map.
    oroboro: Boolean((r.oroboro_code || "").trim()),
    lat: coords.get(r.id)?.lat ?? null,
    lng: coords.get(r.id)?.lng ?? null,
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
console.log("with coordinates:", shops.filter((s) => s.lat && s.lng).length, "/", shops.length);
console.log("mappable (oroboro + coords):", shops.filter((s) => s.oroboro && s.lat && s.lng).length);
