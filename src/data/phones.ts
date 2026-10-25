/**
 * The phone catalogue for the EMI shop.
 *
 * These are the models that move in this segment — the average device Credit
 * Speed finances is around ₹21,500, so the list is built around ₹8,000 to
 * ₹35,000 rather than flagships. The bet is that across 64 partner shops,
 * someone stocks whichever of these a customer picks.
 *
 * PRICES ARE PLACEHOLDERS AND MUST BE CONFIRMED BEFORE THIS GOES LIVE.
 * Street prices move constantly and vary by shop. A wrong price on a lending
 * site is not cosmetic: the customer arrives at the counter, the number is
 * different, and the merchant has to explain it. Set PRICES_CONFIRMED to true
 * once the list has been checked against what merchants actually quote.
 */

export const PRICES_CONFIRMED = false;

export type Phone = {
  brand: string;
  model: string;
  slug: string;
  /** Indicative street price in rupees, inclusive of GST. */
  price: number;
  /** One line a shopkeeper would actually use to sell it. */
  highlight: string;
};

export const BRANDS = [
  "Samsung",
  "Redmi",
  "realme",
  "vivo",
  "OPPO",
  "Motorola",
  "POCO",
  "Infinix",
  "iQOO",
  "Apple",
] as const;

export const PHONES: Phone[] = [
  { brand: "Samsung", model: "Galaxy M05", slug: "samsung-galaxy-m05", price: 7499, highlight: "Big battery, everyday use" },
  { brand: "Samsung", model: "Galaxy M15 5G", slug: "samsung-galaxy-m15-5g", price: 12499, highlight: "5G with a 6000mAh battery" },
  { brand: "Samsung", model: "Galaxy A16 5G", slug: "samsung-galaxy-a16-5g", price: 18999, highlight: "Super AMOLED display" },
  { brand: "Samsung", model: "Galaxy A35 5G", slug: "samsung-galaxy-a35-5g", price: 30999, highlight: "Flagship camera features" },

  { brand: "Redmi", model: "Redmi A4 5G", slug: "redmi-a4-5g", price: 8499, highlight: "Cheapest 5G in the shop" },
  { brand: "Redmi", model: "Redmi 14C 5G", slug: "redmi-14c-5g", price: 10999, highlight: "Large screen, long battery" },
  { brand: "Redmi", model: "Redmi Note 14 5G", slug: "redmi-note-14-5g", price: 17999, highlight: "The one most people ask for" },
  { brand: "Redmi", model: "Redmi Note 14 Pro 5G", slug: "redmi-note-14-pro-5g", price: 24999, highlight: "200MP camera" },

  { brand: "realme", model: "realme C61", slug: "realme-c61", price: 8999, highlight: "Tough build, good battery" },
  { brand: "realme", model: "realme NARZO 70x 5G", slug: "realme-narzo-70x-5g", price: 12999, highlight: "Fast charging, 5G" },
  { brand: "realme", model: "realme 13 5G", slug: "realme-13-5g", price: 18999, highlight: "Gaming performance" },
  { brand: "realme", model: "realme 13 Pro 5G", slug: "realme-13-pro-5g", price: 26999, highlight: "Curved AMOLED screen" },

  { brand: "vivo", model: "vivo Y18", slug: "vivo-y18", price: 9499, highlight: "Simple, reliable, good service" },
  { brand: "vivo", model: "vivo T3x 5G", slug: "vivo-t3x-5g", price: 13999, highlight: "Best value in vivo's range" },
  { brand: "vivo", model: "vivo Y28 5G", slug: "vivo-y28-5g", price: 14999, highlight: "5G with a big battery" },
  { brand: "vivo", model: "vivo V40e 5G", slug: "vivo-v40e-5g", price: 28999, highlight: "Portrait camera, premium feel" },

  { brand: "OPPO", model: "OPPO A3x 5G", slug: "oppo-a3x-5g", price: 10999, highlight: "Drop resistant, splash proof" },
  { brand: "OPPO", model: "OPPO K12x 5G", slug: "oppo-k12x-5g", price: 14999, highlight: "Strong battery life" },
  { brand: "OPPO", model: "OPPO A79 5G", slug: "oppo-a79-5g", price: 19999, highlight: "Large AMOLED display" },

  { brand: "Motorola", model: "Moto G35 5G", slug: "moto-g35-5g", price: 10999, highlight: "Clean software, no bloat" },
  { brand: "Motorola", model: "Moto G85 5G", slug: "moto-g85-5g", price: 17999, highlight: "Curved pOLED display" },

  { brand: "POCO", model: "POCO M6 5G", slug: "poco-m6-5g", price: 9999, highlight: "Budget 5G that performs" },
  { brand: "POCO", model: "POCO X6 5G", slug: "poco-x6-5g", price: 19999, highlight: "Gaming favourite" },

  { brand: "Infinix", model: "Infinix HOT 50 5G", slug: "infinix-hot-50-5g", price: 9999, highlight: "Slim, large display" },
  { brand: "Infinix", model: "Infinix NOTE 40X 5G", slug: "infinix-note-40x-5g", price: 12999, highlight: "Fast charging" },

  { brand: "iQOO", model: "iQOO Z9x 5G", slug: "iqoo-z9x-5g", price: 12999, highlight: "6000mAh, for heavy use" },
  { brand: "iQOO", model: "iQOO Z9s 5G", slug: "iqoo-z9s-5g", price: 19999, highlight: "Smooth for gaming" },

  { brand: "Apple", model: "iPhone 13", slug: "iphone-13", price: 44999, highlight: "Still the most asked-for iPhone" },
  { brand: "Apple", model: "iPhone 15", slug: "iphone-15", price: 62999, highlight: "Latest standard iPhone" },
];

/**
 * EMI terms shown to the customer.
 *
 * Deliberately presented as an indicative instalment rather than an interest
 * rate: the final figure is set when the application is approved, and quoting
 * a rate the merchant then contradicts at the counter is worse than quoting
 * nothing at all. Confirm these tenures and the down payment range before
 * launch.
 */
export const TENURES = [6, 9, 12] as const;
export const DEFAULT_TENURE = 9;
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
 * Transwarranty have since raised the rate to 27% across all tenures, up
 * from 24.07% on short tenures and 25.45% on long ones.
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
 * customer who budgeted from an instalment alone blames the shopkeeper for
 * a number this website published.
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
