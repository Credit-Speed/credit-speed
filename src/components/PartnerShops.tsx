import Link from "next/link";

export type Shop = {
  name: string;
  city: string;
  locality: string | null;
  pin: string | null;
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
export function ShopGrid({ shops }: { shops: Shop[] }) {
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
