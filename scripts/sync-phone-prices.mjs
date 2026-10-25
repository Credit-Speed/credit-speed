/**
 * Regenerate the EMI shop's price list from Credit Speed's own loan book.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/sync-phone-prices.mjs
 *
 * Every financed phone carries mandatory insurance, so `customers` holds the
 * brand, model and counter price of every device we have ever funded. That is
 * the only honest source for what this website publishes: a price a customer
 * actually paid at a partner shop, not a figure from another sales channel.
 *
 * The loan book is typed by hand at the counter, so it arrives dirty —
 * "Motorola"/"MOTOROLA"/"motorola", "Redmin" for Redmi, "Samsung M35" sitting
 * in the brand column, storage variants glued onto model names, trailing
 * spaces splitting one model into two. This normalises all of that, then
 * refuses to publish anything the data does not actually support.
 *
 * Writes src/data/phone-prices.json and prints what it decided and why.
 * Nothing is published silently: every excluded model is listed with a reason.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/phone-prices.json");

// ── Publishing rules ──────────────────────────────────────────────────────
//
// Handsets lose 10-20% over a model year, so an old price is a wrong price.
// One sale is thin evidence, so it has to be recent to count; two or more
// sales agreeing is worth more, so it is allowed to be older.
export const FRESH_SINGLE_DAYS = 30;
export const FRESH_MULTI_DAYS = 90;
// Above this, a single transaction is not enough to publish — an error here
// costs the customer the most, and high-value rows are where data entry slips
// (a used device, or a deposit typed into the price field).
export const REVIEW_ABOVE = 35000;
// Prices this far apart under one model name mean we have merged variants
// that should not have been merged.
export const VARIANT_SPREAD = 0.15;

// ── Brand canonicalisation ────────────────────────────────────────────────
// Keys are lowercase as typed at the counter; values are how the brand writes
// itself (realme and vivo are deliberately lowercase, iQOO mixed).
const BRANDS = {
  motorola: "Motorola", moto: "Motorola",
  samsung: "Samsung",
  redmi: "Redmi", redmin: "Redmi", mi: "Redmi", xiaomi: "Redmi",
  realme: "realme",
  vivo: "vivo",
  oppo: "OPPO",
  oneplus: "OnePlus", "one plus": "OnePlus",
  infinix: "Infinix",
  poco: "POCO",
  iqoo: "iQOO",
  apple: "Apple", iphone: "Apple",
  tecno: "Tecno", lava: "Lava", itel: "itel", nokia: "Nokia",
  "ai plus": "AI+", "ai+": "AI+", aiplus: "AI+",
};
// Longest first, so "one plus" wins over "one" and "ai plus" over "ai".
const BRAND_KEYS = Object.keys(BRANDS).sort((a, b) => b.length - a.length);

/**
 * Splits a brand field that may also contain the model ("Samsung M35").
 * Returns a null brand for anything unrecognised — never a guess.
 */
export function splitBrand(raw) {
  const s = String(raw ?? "").trim().replace(/\s+/g, " ");
  const lower = s.toLowerCase();
  for (const key of BRAND_KEYS) {
    if (lower === key) return { brand: BRANDS[key], extraModel: "" };
    if (lower.startsWith(key + " "))
      return { brand: BRANDS[key], extraModel: s.slice(key.length).trim() };
  }
  return { brand: null, extraModel: "", raw: s };
}

/**
 * Reduces a hand-typed model to a stable key, lifting the storage variant out
 * so "G-37 4/64" and "G37" are recognised as one phone.
 */
export function normaliseModel(rawModel, extraModel = "", brand = "") {
  let s = [extraModel, String(rawModel ?? "")].filter(Boolean).join(" ").trim();
  // Drop a brand name repeated inside the model field.
  if (brand) s = s.replace(new RegExp("^" + brand.replace(/[+]/g, "\\+") + "\\s+", "i"), "");
  // Lift out the storage spec: "4/128", "6 / 128".
  let variant = "";
  const m = s.match(/\b(\d{1,3})\s*\/\s*(\d{2,4})\b/);
  if (m) {
    variant = `${m[1]}/${m[2]}`;
    s = s.replace(m[0], " ");
  }
  s = s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  // "G 37" -> "G37", "y 11" -> "Y11". Only a single letter glues to digits, so
  // "Note 15" and "Smart 20" are left alone.
  s = s.replace(/\b([A-Za-z])\s+(\d)/g, "$1$2");
  return { key: s.toUpperCase().trim(), variant };
}

// Only network/feature tokens stay shouting. Samsung writes "S24 Ultra" and
// Redmi writes "A7 Pro", so those take ordinary title case.
const FORCE_UPPER = new Set(["5G", "4G", "NFC"]);

/** Display casing: model codes stay uppercase, words get title case. */
export function displayModel(key) {
  return key
    .split(" ")
    .map((t) => {
      if (FORCE_UPPER.has(t)) return t;
      if (/^\d+G$/.test(t)) return t;
      // Alphanumeric codes (G37, A6X, P4R, S24, NE221) stay as-is.
      if (/\d/.test(t) && /[A-Z]/.test(t)) return t;
      if (/^\d+$/.test(t)) return t;
      return t.charAt(0) + t.slice(1).toLowerCase();
    })
    .join(" ");
}

export const slugify = (brand, model) =>
  `${brand} ${model}`.toLowerCase().replace(/\+/g, "-plus").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const i = s.length >> 1;
  return s.length % 2 ? s[i] : Math.round((s[i - 1] + s[i]) / 2);
};

/** Groups raw loan rows into one entry per real phone. */
export function aggregate(rows, today = new Date()) {
  const groups = new Map();
  const rejected = [];

  for (const r of rows) {
    const price = Number(r.product_value);
    if (!Number.isFinite(price) || price <= 0) continue;

    const { brand, extraModel, raw } = splitBrand(r.brand);
    if (!brand) {
      rejected.push({ brand: raw || String(r.brand ?? ""), model: String(r.model ?? ""), price, reason: "unrecognised brand — add it to the brand map" });
      continue;
    }
    const { key, variant } = normaliseModel(r.model, extraModel, brand);
    if (!key) {
      rejected.push({ brand, model: "", price, reason: "no model recorded" });
      continue;
    }

    const id = `${brand}|${key}`;
    if (!groups.has(id))
      groups.set(id, { brand, modelKey: key, prices: [], dates: [], variants: new Set(), seenAs: new Set() });
    const g = groups.get(id);
    g.prices.push(price);
    if (r.created_at) g.dates.push(new Date(r.created_at));
    if (variant) g.variants.add(variant);
    g.seenAs.add(`${String(r.brand ?? "").trim()} ${String(r.model ?? "").trim()}`.trim());
  }

  const out = [];
  for (const g of groups.values()) {
    const last = g.dates.length ? new Date(Math.max(...g.dates)) : null;
    const daysSince = last ? Math.floor((today - last) / 86400000) : null;
    const med = median(g.prices);
    const min = Math.min(...g.prices);
    const max = Math.max(...g.prices);
    out.push({
      brand: g.brand,
      model: displayModel(g.modelKey),
      slug: slugify(g.brand, g.modelKey),
      price: med,
      units: g.prices.length,
      minPrice: min,
      maxPrice: max,
      spread: med ? (max - min) / med : 0,
      lastFinanced: last ? last.toISOString().slice(0, 10) : null,
      daysSince,
      variants: [...g.variants].sort(),
      seenAs: [...g.seenAs].sort(),
    });
  }
  return { entries: out, rejected };
}

/** Decides what may be published, and records a reason for everything else. */
export function classify(entries) {
  const published = [], held = [];
  for (const e of entries) {
    const limit = e.units >= 2 ? FRESH_MULTI_DAYS : FRESH_SINGLE_DAYS;
    if (e.daysSince === null) { held.push({ ...e, reason: "no sale date recorded" }); continue; }
    if (e.daysSince > limit) {
      held.push({ ...e, reason: `last financed ${e.daysSince} days ago (limit ${limit} for ${e.units} sale${e.units > 1 ? "s" : ""}) — price is probably stale` });
      continue;
    }
    if (e.units === 1 && e.price > REVIEW_ABOVE) {
      held.push({ ...e, reason: `one sale at ₹${e.price.toLocaleString("en-IN")} — above ₹${REVIEW_ABOVE.toLocaleString("en-IN")} a single transaction is not enough to publish; confirm it was a new device` });
      continue;
    }
    if (e.spread > VARIANT_SPREAD) {
      held.push({ ...e, reason: `prices ₹${e.minPrice.toLocaleString("en-IN")}-₹${e.maxPrice.toLocaleString("en-IN")} (${Math.round(e.spread * 100)}% apart) — variants merged that should not be` });
      continue;
    }
    published.push(e);
  }
  published.sort((a, b) => b.units - a.units || b.price - a.price);
  held.sort((a, b) => b.price - a.price);
  return { published, held };
}

/** Flags model names that are probably the same phone recorded two ways. */
export function nearDuplicates(entries) {
  const pairs = [];
  const base = (m) => m.replace(/\s*(5G|4G)$/i, "").trim().toUpperCase();
  for (let i = 0; i < entries.length; i++)
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i], b = entries[j];
      if (a.brand !== b.brand) continue;
      if (base(a.model) === base(b.model))
        pairs.push({ a: `${a.brand} ${a.model} (₹${a.price})`, b: `${b.brand} ${b.model} (₹${b.price})`, note: "same phone recorded with and without a network suffix?" });
    }
  return pairs;
}

export function build(rows, today = new Date()) {
  const { entries, rejected } = aggregate(rows, today);
  const { published, held } = classify(entries);
  return {
    generatedAt: today.toISOString().slice(0, 10),
    source: "customers.product_value — Credit Speed loan book (insurance is mandatory on every loan, so coverage is complete)",
    rules: { FRESH_SINGLE_DAYS, FRESH_MULTI_DAYS, REVIEW_ABOVE, VARIANT_SPREAD },
    totals: { rawRows: rows.length, phones: published.length, held: held.length, rejected: rejected.length },
    phones: published.map(({ spread, seenAs, ...p }) => p),
    held,
    rejected,
    review: nearDuplicates(entries),
  };
}

// ── CLI ───────────────────────────────────────────────────────────────────
//
// Talks to Supabase over its REST endpoint with global fetch, so this script
// needs no dependencies at all — a marketing site should not carry a database
// client just to regenerate a price list.
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
    process.exit(1);
  }

  const rows = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const q = new URLSearchParams({
      select: "brand,model,product_value,created_at",
      status: "eq.enabled",
      product_value: "gt.0",
      limit: String(PAGE),
      offset: String(offset),
    });
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/customers?${q}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.error(`Query failed (HTTP ${res.status}): ${await res.text()}`);
      process.exit(1);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE) break;
  }

  const result = build(rows);
  writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");

  console.log(`\nRead ${result.totals.rawRows} financed devices.\n`);
  console.log(`PUBLISHING ${result.phones.length}:`);
  for (const p of result.phones)
    console.log(`  ₹${String(p.price).padStart(6)}  ${p.brand} ${p.model}  (${p.units} sale${p.units > 1 ? "s" : ""}, ${p.daysSince}d ago)${p.variants.length ? "  variants: " + p.variants.join(", ") : ""}`);
  if (result.held.length) {
    console.log(`\nHELD BACK ${result.held.length}:`);
    for (const h of result.held) console.log(`  ${h.brand} ${h.model} — ${h.reason}`);
  }
  if (result.rejected.length) {
    console.log(`\nCOULD NOT READ ${result.rejected.length}:`);
    for (const r of result.rejected) console.log(`  "${r.brand} ${r.model}" — ${r.reason}`);
  }
  if (result.review.length) {
    console.log(`\nWORTH A LOOK:`);
    for (const d of result.review) console.log(`  ${d.a} vs ${d.b} — ${d.note}`);
  }
  console.log(`\nWrote ${OUT}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
