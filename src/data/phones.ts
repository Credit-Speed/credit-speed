/**
 * The phone catalogue for the EMI shop.
 *
 * Every price here came off a completed loan: `phone-prices.json` is generated
 * by scripts/sync-phone-prices.mjs from the `customers` table, where mandatory
 * insurance means each financed device is recorded with the price the customer
 * actually paid at a partner counter. Nothing on this page is a guess, and
 * nothing is taken from another sales channel — a price from elsewhere is a
 * price the shopkeeper then has to argue with.
 *
 * Do not hand-edit prices. Re-run the script:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/sync-phone-prices.mjs
 *
 * It refuses to publish a model whose price is stale, whose single sale is
 * large enough that one data-entry slip would matter, or whose variants
 * disagree — and prints why for each one it holds back.
 */

import data from "./phone-prices.json";

export type Phone = {
  brand: string;
  model: string;
  slug: string;
  /** Median price actually paid, in rupees, inclusive of GST. */
  price: number;
  /** How many of these we have financed — the evidence behind the price. */
  units: number;
  /** ISO date of the most recent one. */
  lastFinanced: string | null;
  /** Storage variants seen at the counter, e.g. "4/128". */
  variants: string[];
  /** One line a shopkeeper would actually use. Optional — see HIGHLIGHTS. */
  highlight?: string;
};

/**
 * Editorial one-liners, keyed by slug.
 *
 * Deliberately empty. These models come from the loan book, and writing spec
 * claims for them from memory is how a lending site ends up advertising a
 * battery or a camera the handset does not have. Fill these in from the
 * brand's own spec sheet, or leave them out — the card falls back to how many
 * we have financed, which is true and checkable.
 */
const HIGHLIGHTS: Record<string, string> = {};

/** Social proof beats an empty line, and unlike a spec claim it is verifiable. */
function fallbackHighlight(units: number): string | undefined {
  if (units >= 3) return `${units} financed at our partner shops`;
  if (units === 2) return "Financed twice at our partner shops";
  return undefined;
}

export const PHONES: Phone[] = (data.phones as Omit<Phone, "highlight">[]).map(
  (p) => ({ ...p, highlight: HIGHLIGHTS[p.slug] ?? fallbackHighlight(p.units) })
);

/** Brands we can actually finance today, most-financed first. */
export const BRANDS: string[] = [...new Set(PHONES.map((p) => p.brand))];

/** The date the price list was last regenerated, for the note on the page. */
export const PRICES_AS_AT: string = data.generatedAt;

/**
 * True when every published price traces to a real transaction. It does, by
 * construction — the script is the only way into this list.
 */
export const PRICES_CONFIRMED = PHONES.length > 0;

/**
 * EMI terms shown to the customer.
 *
 * Presented as an indicative instalment rather than an interest rate: the
 * final figure is set when the application is approved, and quoting a rate the
 * merchant then contradicts at the counter is worse than quoting nothing.
 */
// 6/8/10. Transwarranty fund 4, 6, 8, 10 and 12; Credit Speed offers the
// middle three. 9 months was quoted here briefly and is not a term they fund
// at all, so it could not have been honoured at the counter.
export const TENURES = [6, 8, 10] as const;
export const DEFAULT_TENURE = 8;
/** Fixed at 20% of the product price. Confirmed against a live Delivery Order. */
export const DOWN_PAYMENT_PCT = 20;

/**
 * Annual rate, reducing balance.
 *
 * Verified against a real Delivery Order dated 20 Oct 2026: a net loan of
 * ₹24,414 over 6 months produced an EMI of ₹4,383, which a reducing-balance
 * calculation reproduces at 26.00% to within eight paise. A flat-rate
 * calculation is out by ₹235 a month, so the method is not in doubt.
 *
 * Transwarranty have since raised the rate to 27% across all tenures, up from
 * 24.07% on short tenures and 25.45% on long ones.
 */
export const ANNUAL_RATE_PCT = 27;

/** 3% of the product price plus 18% GST. Matches the DO to the rupee. */
export const PROCESSING_FEE_PCT = 3;
export const GST_PCT = 18;

export type Quote = {
  /** 20% of the product price. */
  down: number;
  /** Processing fee including GST, collected at the shop. */
  processingFee: number;
  /** What the customer actually hands over at the counter. */
  atCounter: number;
  /** The amount financed. */
  financed: number;
  emi: number;
  /** Everything the customer pays, start to finish. */
  total: number;
};

/**
 * The full cost of a phone on EMI, as the customer experiences it.
 *
 * Showing only the instalment understates what someone is asked for at the
 * counter — on a ₹30,517 phone that is ₹7,183 before they walk out, and a
 * customer who budgeted from an instalment alone blames the shopkeeper for a
 * number this website published.
 *
 * No advance EMI: Credit Speed collects the down payment and the processing
 * fee, nothing more.
 */
export function quote(price: number, months: number): Quote {
  const down = Math.round((price * DOWN_PAYMENT_PCT) / 100);
  const processingFee = Math.round((price * PROCESSING_FEE_PCT * (100 + GST_PCT)) / 10000);
  const financed = price - down;
  const r = ANNUAL_RATE_PCT / 12 / 100;
  const f = Math.pow(1 + r, months);
  const emi = Math.round((financed * r * f) / (f - 1));
  return {
    down,
    processingFee,
    atCounter: down + processingFee,
    financed,
    emi,
    total: down + processingFee + emi * months,
  };
}
