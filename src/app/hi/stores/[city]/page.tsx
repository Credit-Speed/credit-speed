import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShopGrid, type Shop } from "@/components/PartnerShops";
import PartnerMap from "@/components/PartnerMap";
import data from "@/data/partner-shops.json";

const ALL = data.shops as Shop[];

/** Same source as the English page — one list, two languages. */
const CITIES = [...new Set(ALL.map((s) => s.city))].map((city) => ({
  city,
  slug: city.toLowerCase().replace(/\s+/g, "-"),
}));

/** City names people actually read in Hindi. Falls back to the English name. */
const HI_CITY: Record<string, string> = {
  Kanpur: "कानपुर",
  Lucknow: "लखनऊ",
  Varanasi: "वाराणसी",
};

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

function resolve(slug: string) {
  const match = CITIES.find((c) => c.slug === slug);
  if (!match) return null;
  return {
    city: match.city,
    hi: HI_CITY[match.city] || match.city,
    shops: ALL.filter((s) => s.city === match.city),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const found = resolve(slug);
  if (!found) return {};
  const { hi, shops } = found;
  return {
    title: `${hi} में मोबाइल EMI वाली दुकानें — पार्टनर स्टोर`,
    description: `${hi} की ${shops.length} पार्टनर मोबाइल दुकानों पर बिना क्रेडिट कार्ड के स्मार्टफोन EMI पर खरीदें। सिर्फ आधार, पैन और बैंक अकाउंट चाहिए।`,
    alternates: {
      canonical: `/hi/stores/${slug}`,
      languages: {
        "en-IN": `/stores/${slug}`,
        "hi-IN": `/hi/stores/${slug}`,
      },
    },
  };
}

export default async function HindiCityStoresPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const found = resolve(slug);
  if (!found) notFound();
  const { city, hi, shops } = found;

  const FAQ = [
    {
      q: `क्या ${hi} में बिना क्रेडिट कार्ड के मोबाइल EMI पर मिल सकता है?`,
      a: `हाँ। ${hi} की पार्टनर दुकानों पर Credit Speed बिना क्रेडिट कार्ड के स्मार्टफोन फाइनेंस करता है। आधार, पैन और बैंक अकाउंट चाहिए, और फैसला दुकान पर ही हो जाता है।`,
    },
    {
      q: "कौन से डॉक्यूमेंट साथ ले जाने हैं?",
      a: "आधार कार्ड, पैन कार्ड और बैंक अकाउंट की डिटेल। आधार से लिंक वाला मोबाइल नंबर ज़रूर साथ रखें, वेरिफिकेशन उसी पर होता है।",
    },
    {
      q: "क्या CIBIL स्कोर ज़रूरी है?",
      a: "क्रेडिट हिस्ट्री से मदद मिलती है लेकिन सिर्फ वही नहीं देखा जाता। डॉक्यूमेंट लेकर किसी भी पार्टनर दुकान पर जाइए, दुकानदार एप्लीकेशन भर देगा।",
    },
    {
      q: "अप्रूवल में कितना समय लगता है?",
      a: "ज़्यादातर मामलों में काउंटर पर ही कुछ मिनटों में फैसला हो जाता है। अप्रूव होने पर उसी दिन फोन मिल जाता है।",
    },
    {
      q: `${hi} में कितनी पार्टनर दुकानें हैं?`,
      a: `${hi} में इस समय Credit Speed की ${shops.length} पार्टनर मोबाइल दुकानें हैं, और पूरी लिस्ट इसी पेज पर दी गई है।`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        inLanguage: "hi-IN",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "होम", item: "https://creditspeed.in/hi" },
          { "@type": "ListItem", position: 2, name: hi, item: `https://creditspeed.in/hi/stores/${slug}` },
        ],
      },
    ],
  };

  return (
    <main className="bg-[#050B17] min-h-screen" lang="hi-IN">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="pt-36 pb-14 px-6 lg:px-12 text-center">
        <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-5">
          {hi} · उत्तर प्रदेश
        </p>
        <h1 className="font-display text-white text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05] max-w-4xl mx-auto">
          {hi} में मोबाइल{" "}
          <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
            EMI वाली दुकानें।
          </span>
        </h1>
        <p className="text-white/60 text-base leading-relaxed max-w-2xl mx-auto mt-7">
          {hi} की {shops.length} मोबाइल दुकानें Credit Speed से स्मार्टफोन फाइनेंस करती हैं।
          आधार, पैन और बैंक डिटेल लेकर किसी भी दुकान पर जाइए — क्रेडिट कार्ड की ज़रूरत नहीं,
          और फैसला काउंटर पर ही मिल जाता है।
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            href={`/stores/${slug}`}
            lang="en-IN"
            className="px-6 py-3 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
          >
            Read in English
          </Link>
        </div>
      </section>

      <section className="py-14 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <PartnerMap shops={shops} city={city} />
        </div>
      </section>

      <section className="py-14 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-3">
            {hi} की सभी पार्टनर दुकानें
          </h2>
          <p className="text-white/45 text-sm mb-9 max-w-2xl">
            {data.generated_at} तक अपडेटेड। अगर आपकी नज़दीकी दुकान यहाँ नहीं दिख रही, तो
            दुकानदार से कहिए कि वो जुड़ जाएं — आमतौर पर एक-दो दिन में हो जाता है।
          </p>
          <ShopGrid shops={shops} />
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-10">
            अक्सर पूछे जाने वाले सवाल
          </h2>
          <div className="space-y-7">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-white text-base font-semibold mb-2">{f.q}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 border-t border-white/5 text-center">
        <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-6">
          नज़दीकी दुकान नहीं मिल रही?
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto mb-8">
          हमें कॉल कीजिए, हम आपके इलाके की सबसे नज़दीकी पार्टनर दुकान बता देंगे।
        </p>
        <Link
          href="/contact"
          className="inline-block px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
        >
          संपर्क करें
        </Link>
      </section>

      <Footer />
    </main>
  );
}
