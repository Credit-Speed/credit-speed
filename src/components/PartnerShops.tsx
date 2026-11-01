import Link from "next/link";

export type Shop = {
  id: string;
  name: string;
  city: string;
  locality: string | null;
  pin: string | null;
  /** True when the merchant is live on Oroboro and can originate a loan. */
  oroboro: boolean;
  /** From a field officer's logged beat visit; null when never visited. */
  lat: number | null;
  lng: number | null;
};

/**
 * The partner shop list, server-rendered.
 *
 * This is the only content on the site a competitor cannot reproduce: real
 * shops that actually finance phones with us. It has to be in the HTML, not
 * fetched after load, or none of it counts for search.
 *
 * Shop name, locality and PIN only. Never a phone number, never a street
 * address — a store locator exists so a customer can walk in, not so the
 * merchant list can be scraped and called.
 */
/**
 * A Google Maps link for a shop.
 *
 * Where a field officer has logged a visit we send the exact coordinate, which
 * is ground truth — someone stood there. Otherwise we send the shop name with
 * its locality and PIN and let Google find it: most mobile shops list
 * themselves, so the customer usually lands on the business itself rather than
 * on a point we calculated.
 *
 * Note what is NOT in this URL: the street address. It is deliberately absent
 * from this component, and putting it in a link would publish it just as
 * surely as printing it. The query carries only what the page already shows.
 *
 * A link rather than a pin on our own map is also the licence-clean route:
 * Google's terms do not permit displaying Google-derived coordinates on a
 * non-Google map, and ours is Leaflet.
 */
export function mapsUrl(s: Pick<Shop, "name" | "city" | "locality" | "pin" | "lat" | "lng">): string {
  const query =
    s.lat != null && s.lng != null
      ? `${s.lat},${s.lng}`
      : [s.name, s.locality, s.city, s.pin].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function ShopGrid({
  shops,
  directionsLabel = "Directions",
}: {
  shops: Shop[];
  /** Overridden on the Hindi pages. */
  directionsLabel?: string;
}) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 list-none p-0 m-0">
      {shops.map((s, i) => (
        <li
          key={`${s.name}-${i}`}
          className="text-sm leading-relaxed border-b border-white/5 pb-2.5"
        >
          <span className="text-white/90">{s.name}</span>
          {(s.locality || s.pin) && (
            <span className="text-white/40">
              {" — "}
              {s.locality ? s.locality : s.city}
              {s.pin ? ` ${s.pin}` : ""}
            </span>
          )}
          <a
            href={mapsUrl(s)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${directionsLabel}: ${s.name}`}
            className="text-gold-400/80 hover:text-gold-300 ml-2 whitespace-nowrap"
          >
            {directionsLabel} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Groups by PIN so the page carries real area signal where we have it. */
export function groupByPin(shops: Shop[]): [string, Shop[]][] {
  const map = new Map<string, Shop[]>();
  shops
    .filter((s) => s.pin)
    .forEach((s) => {
      const list = map.get(s.pin as string) || [];
      list.push(s);
      map.set(s.pin as string, list);
    });
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

export function StoresCta() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Link
        href="/contact"
        className="px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
      >
        Find your nearest shop
      </Link>
      <Link
        href="/partner"
        className="px-7 py-3.5 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
      >
        List your shop
      </Link>
    </div>
  );
}
