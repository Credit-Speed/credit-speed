import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import data from "@/data/partner-shops.json";

const SHOPS = (data.shops as { city: string }[]).length;

export const metadata: Metadata = {
  title: "बिना क्रेडिट कार्ड मोबाइल EMI पर लें — कानपुर",
  description:
    "कानपुर में बिना क्रेडिट कार्ड के मोबाइल EMI पर खरीदें। सिर्फ आधार, पैन और बैंक अकाउंट चाहिए। दुकान पर ही कुछ मिनट में फैसला, उसी दिन फोन घर ले जाएं।",
  alternates: {
    canonical: "/hi",
    languages: { "en-IN": "/", "hi-IN": "/hi" },
  },
  openGraph: {
    title: "बिना क्रेडिट कार्ड मोबाइल EMI पर लें | Credit Speed",
    description:
      "कानपुर में बिना क्रेडिट कार्ड के मोबाइल EMI पर खरीदें। आधार, पैन और बैंक अकाउंट से काम हो जाता है।",
    url: "/hi",
  },
};

const STEPS = [
  {
    t: "अपनी नज़दीकी पार्टनर दुकान पर जाएं",
    d: "जो फोन लेना है वो चुनिए। बाकी काम दुकानदार कर देगा — अलग से कहीं जाने की ज़रूरत नहीं।",
  },
  {
    t: "आधार, पैन और बैंक डिटेल दिखाएं",
    d: "क्रेडिट कार्ड नहीं चाहिए। आधार से लिंक वाला मोबाइल नंबर साथ रखें, वेरिफिकेशन उसी पर होता है।",
  },
  {
    t: "फोन लेकर घर जाएं",
    d: "ज़्यादातर मामलों में दुकान के काउंटर पर ही कुछ मिनट में फैसला हो जाता है। डाउन पेमेंट दीजिए और फोन आपका।",
  },
];

const FAQ = [
  {
    q: "क्या बिना क्रेडिट कार्ड के मोबाइल EMI पर मिल सकता है?",
    a: "हाँ। Credit Speed कानपुर की पार्टनर दुकानों पर बिना क्रेडिट कार्ड के स्मार्टफोन फाइनेंस करता है। आपको सिर्फ आधार कार्ड, पैन कार्ड और बैंक अकाउंट चाहिए।",
  },
  {
    q: "कौन से डॉक्यूमेंट लगते हैं?",
    a: "आधार कार्ड, पैन कार्ड और बैंक अकाउंट की डिटेल। आधार से जो मोबाइल नंबर लिंक है वो साथ रखें, क्योंकि वेरिफिकेशन उसी नंबर पर होता है।",
  },
  {
    q: "क्या CIBIL स्कोर ज़रूरी है?",
    a: "क्रेडिट हिस्ट्री होने से मदद मिलती है, लेकिन सिर्फ वही नहीं देखा जाता। अपने डॉक्यूमेंट लेकर किसी भी पार्टनर दुकान पर जाइए, दुकानदार आपकी एप्लीकेशन भर देगा और वहीं पता चल जाएगा।",
  },
  {
    q: "अप्रूवल में कितना समय लगता है?",
    a: "आमतौर पर दुकान के काउंटर पर ही कुछ ही मिनटों में फैसला हो जाता है। अप्रूव होने पर उसी दिन फोन मिल जाता है।",
  },
  {
    q: "डाउन पेमेंट कितना देना होता है?",
    a: "डाउन पेमेंट फोन की कीमत और आपकी एप्लीकेशन पर निर्भर करता है। सही रकम दुकान पर ही बता दी जाती है, उससे पहले कोई छिपा हुआ चार्ज नहीं होता।",
  },
  {
    q: "कानपुर में कहाँ-कहाँ दुकानें हैं?",
    a: `कानपुर में कल्याणपुर, यशोदा नगर, बर्रा, गोविंद नगर, किदवई नगर, शास्त्री नगर, स्वरूप नगर और काकादेव समेत कई इलाकों में पार्टनर दुकानें हैं। पूरी लिस्ट वेबसाइट पर दी गई है।`,
  },
];

export default function HindiPage() {
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
    ],
  };

  return (
    // The document language is set to en-IN by the root layout, which owns the
    // <html> element. Marking the subtree is what tells a crawler — and a
    // screen reader — that everything inside is Hindi.
    <main className="bg-[#050B17] min-h-screen" lang="hi-IN">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="pt-36 pb-16 px-6 lg:px-12 text-center">
        <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-5">
          कानपुर · उत्तर प्रदेश
        </p>
        <h1 className="font-display text-white text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05] max-w-4xl mx-auto">
          बिना क्रेडिट कार्ड{" "}
          <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
            मोबाइल EMI पर।
          </span>
        </h1>
        <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mt-7">
          कानपुर की {SHOPS} पार्टनर मोबाइल दुकानों पर Credit Speed से स्मार्टफोन आसान
          मासिक किश्तों पर खरीदें। क्रेडिट कार्ड की ज़रूरत नहीं — आधार, पैन और बैंक
          अकाउंट से काम हो जाता है।
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-9">
          <Link
            href="/stores/kanpur"
            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
          >
            कानपुर की दुकानें देखें
          </Link>
          <Link
            href="/"
            className="px-7 py-3.5 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
            lang="en-IN"
          >
            Read in English
          </Link>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-display text-white text-3xl sm:text-4xl tracking-tighter mb-12 text-center">
            EMI पर फोन कैसे लें
          </h2>
          <div className="grid sm:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {STEPS.map((s, i) => (
              <div key={s.t}>
                <p className="font-display text-gold-400/70 text-3xl tracking-tighter mb-3">
                  0{i + 1}
                </p>
                <h3 className="text-white text-base font-semibold mb-2">{s.t}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
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
          दुकान चलाते हैं?
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto mb-8">
          अपने ग्राहकों को EMI की सुविधा दीजिए और ज़्यादा फोन बेचिए। जुड़ने में एक दिन लगता है।
        </p>
        <Link
          href="/partner"
          className="inline-block px-7 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
        >
          पार्टनर बनें
        </Link>
      </section>

      <Footer />
    </main>
  );
}
