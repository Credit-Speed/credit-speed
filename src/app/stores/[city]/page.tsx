import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShopGrid, groupByPin, type Shop } from "@/components/PartnerShops";
import data from "@/data/partner-shops.json";

const ALL = data.shops as Shop[];

/** Cities are whatever the snapshot contains. A city appears here the day it
 *  has its first partner shop and not before — which is the only honest way
 *  to tell someone there is a shop they can walk into. */
const CITIES = [...new Set(ALL.map((s) => s.city))].map((city) => ({
  city,
  slug: city.toLowerCase().replace(/\s+/g, "-"),
}));

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

function resolve(slug: string) {
  const match = CITIES.find((c) => c.slug === slug);
  if (!match) return null;
  return { city: match.city, shops: ALL.filter((s) => s.city === match.city) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const found = resolve(slug);
  if (!found) return {};
  const { city, shops } = found;
  const title = `Mobile Shops with EMI in ${city} — Partner Stores`;
  const description = `Buy a smartphone on EMI at ${shops.length} partner mobile shops across ${city}. No credit card and no CIBIL history needed — Aadhaar, PAN and a bank account are enough.`;
  return {
    title,
    description,
    alternates: { canonical: `/stores/${slug}` },
    openGraph: { title: `${title} | Credit Speed`, description, url: `/stores/${slug}` },
  };
}

function faqFor(city: string) {
  return [
    {
      q: `Can I buy a mobile on EMI in ${city} without a credit card?`,
      a: `Yes. Credit Speed finances smartphones at partner shops across ${city} without a credit card. You need your Aadhaar, PAN and a bank account, and the decision is usually made while you wait at the shop.`,
    },
    {
      q: "Do I need a CIBIL score to get a phone on EMI?",
      a: "A formal credit history helps but is not the only thing we look at. Walk into any partner shop listed on this page with your documents and the shopkeeper will run the application for you.",
    },
    {
      q: "What documents do I need to bring?",
      a: "Aadhaar card, PAN card and your bank account details. Bring the phone number linked to your Aadhaar, since it is used to verify you.",
    },
    {
      q: "How long does approval take?",
      a: "Most applications are decided within minutes at the shop counter. If approved, you walk out with the phone the same day.",
    },
    {
      q: `How many partner shops are there in ${city}?`,
      a: `There are ${ALL.filter((s) => s.city === city).length} Credit Speed partner mobile shops in ${city} today, and the full list is on this page.`,
    },
  ];
}

export default async function CityStoresPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const found = resolve(slug);
  if (!found) notFound();
  const { city, shops } = found;
  const FAQ = faqFor(city);
  const byPin = groupByPin(shops);
  const pins = byPin.map(([pin]) => pin);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://creditspeed.in/" },
          { "@type": "ListItem", position: 2, name: "Stores", item: "https://creditspeed.in/stores" },
          { "@type": "ListItem", position: 3, name: city, item: `https://creditspeed.in/stores/${slug}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `Credit Speed partner mobile shops in ${city}`,
        numberOfItems: shops.length,
        itemListElement: shops.slice(0, 100).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "MobilePhoneStore",
            name: s.name,
            address: {
              "@type": "PostalAddress",
              addressLocality: s.locality || city,
              addressRegion: "Uttar Pradesh",
              postalCode: s.pin || undefined,
              addressCountry: "IN",
            },
          },
        })),
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
          {city} · Uttar Pradesh
        </p>
        <h1 className="font-display text-white text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] max-w-4xl mx-auto">
          Mobile shops with EMI{" "}
          <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
            in {city}.
          </span>
        </h1>
        <p className="text-white/55 text-base leading-relaxed max-w-2xl mx-auto mt-7">
          {shops.length} mobile shops across {city} finance smartphones with Credit Speed.
          Walk into any of them with your Aadhaar, PAN and bank details — no credit card,
          and a decision while you wait at the counter.
        </p>
      </section>

      <section className="pb-14 px-6 lg:px-12 border-t border-white/5 pt-14">
        <div className="max-w-[1400px] mx-auto grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-display text-gold-400 text-4xl tracking-tighter">{shops.length}</p>
            <p className="text-white/45 text-sm mt-1">partner shops in {city}</p>
          </div>
          <div>
            <p className="font-display text-gold-400 text-4xl tracking-tighter">{pins.length}</p>
            <p className="text-white/45 text-sm mt-1">PIN codes covered</p>
          </div>
          <div>
            <p className="font-display text-gold-400 text-4xl tracking-tighter">Same day</p>
            <p className="text-white/45 text-sm mt-1">approval and handover</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-3">
            Every partner shop in {city}
          </h2>
          <p className="text-white/45 text-sm mb-10 max-w-2xl">
            Updated {data.generated_at}. If your local shop is not listed yet, ask the
            shopkeeper to join — most are approved within a couple of days.
          </p>
          <ShopGrid shops={shops} />
        </div>
      </section>

      {byPin.length > 0 && (
        <section className="py-16 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-8">
              Shops by PIN code
            </h2>
            <div className="flex flex-wrap gap-3">
              {byPin.map(([pin, list]) => (
                <span
                  key={pin}
                  className="px-4 py-2 rounded-full border border-white/10 text-white/60 text-sm"
                >
                  {pin} · {list.length} {list.length === 1 ? "shop" : "shops"}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-10">
            Questions people ask
          </h2>
          <div className="space-y-7">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-white text-base font-semibold mb-2">{f.q}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 border-t border-white/5 text-center">
        <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-6">
          Not sure which shop is closest?
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto mb-8">
          Call us and we will point you to the nearest partner shop in your area.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/contact"
            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
          >
            Contact us
          </Link>
          <Link
            href="/stores"
            className="px-7 py-3.5 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
          >
            All cities
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
