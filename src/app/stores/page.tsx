import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StoresCta, type Shop } from "@/components/PartnerShops";
import data from "@/data/partner-shops.json";

export const metadata: Metadata = {
  title: "Find a Mobile Shop Near You — EMI Partner Stores",
  description:
    "Find mobile shops near you where you can buy a smartphone on EMI without a credit card. Credit Speed partners with mobile retailers across Uttar Pradesh — see partner stores by city.",
  alternates: { canonical: "/stores" },
  openGraph: {
    title: "Find a Mobile Shop Near You | Credit Speed",
    description:
      "Mobile shops across Uttar Pradesh where you can buy a smartphone on easy monthly instalments, without a credit card.",
    url: "/stores",
  },
};

const shops = data.shops as Shop[];

/** One card per city, so this scales the day Lucknow has partner shops. */
const cities = [...new Set(shops.map((s) => s.city))]
  .map((city) => ({
    city,
    slug: city.toLowerCase().replace(/\s+/g, "-"),
    count: shops.filter((s) => s.city === city).length,
  }))
  .sort((a, b) => b.count - a.count);

const STEPS = [
  {
    t: "Walk into a partner shop",
    d: "Pick any shop from the list and choose the phone you want. The shopkeeper does the rest.",
  },
  {
    t: "Show Aadhaar, PAN and bank details",
    d: "No credit card and no paperwork to prepare in advance. Bring the number linked to your Aadhaar.",
  },
  {
    t: "Walk out with the phone",
    d: "Most applications are decided in minutes at the counter. Pay the down payment and the phone is yours.",
  },
];

export default function StoresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://creditspeed.in/" },
          { "@type": "ListItem", position: 2, name: "Stores", item: "https://creditspeed.in/stores" },
        ],
      },
    ],
  };

  return (
    <main className="bg-[#050B17] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="pt-36 pb-16 px-6 lg:px-12 text-center">
        <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-5">
          {shops.length} partner shops
        </p>
        <h1 className="font-display text-white text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] max-w-4xl mx-auto">
          Find shops{" "}
          <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
            near you.
          </span>
        </h1>
        <p className="text-white/55 text-base leading-relaxed max-w-2xl mx-auto mt-7">
          Credit Speed finances smartphones at mobile shops across Uttar Pradesh.
          Buy on easy monthly instalments without a credit card — bring your Aadhaar,
          PAN and bank details, and get a decision while you wait at the counter.
        </p>
      </section>

      <section className="pb-16 px-6 lg:px-12 border-t border-white/5 pt-16">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-10 text-center">
            Partner shops by city
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/stores/${c.slug}`}
                className="block p-7 rounded-2xl border border-white/10 hover:border-gold-400/40 transition-colors"
              >
                <p className="font-display text-white text-2xl tracking-tighter">{c.city}</p>
                <p className="text-gold-400/90 text-sm mt-1">
                  {c.count} partner {c.count === 1 ? "shop" : "shops"}
                </p>
                <p className="text-white/40 text-sm mt-3">See every shop in {c.city} →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-12 text-center">
            How buying on EMI works
          </h2>
          <div className="grid sm:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.t}>
                <p className="font-display text-gold-400/70 text-3xl tracking-tighter mb-3">
                  0{i + 1}
                </p>
                <h3 className="text-white text-base font-semibold mb-2">{s.t}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 border-t border-white/5 text-center">
        <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-6">
          Run a mobile shop?
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto mb-8">
          Offer EMI to your walk-in customers and sell more phones. Onboarding takes a day.
        </p>
        <StoresCta />
      </section>

      <Footer />
    </main>
  );
}
