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
/** Fixed at 20%. A slider implied a flexibility the product does not offer. */
export const DOWN_PAYMENT_PCT = 20;

/**
 * Flat split of the financed amount. No interest rate is claimed, because
 * the rate is set on approval and a figure quoted here that the merchant
 * contradicts at the counter is worse than quoting nothing.
 *
 * This does NOT include the mandatory insurance premium or the processing
 * fee. Both are real costs the customer pays, so the instalment shown is
 * lower than what they will be asked for until those are folded in.
 */
export function monthlyInstalment(price: number, months: number) {
  const down = Math.round((price * DOWN_PAYMENT_PCT) / 100);
  const financed = price - down;
  return { down, financed, emi: Math.round(financed / months) };
}
