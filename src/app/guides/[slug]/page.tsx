import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import data from "@/data/partner-shops.json";
import { GUIDES, type Guide } from "./guides";

const SHOPS = (data.shops as unknown[]).length;

export function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES[slug];
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: {
      title: `${g.title} | Credit Speed`,
      description: g.description,
      url: `/guides/${slug}`,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g: Guide | undefined = GUIDES[slug];
  if (!g) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: g.h1,
        description: g.description,
        author: { "@type": "Organization", name: "Credit Speed Microfinance Private Limited" },
        publisher: { "@type": "Organization", name: "Credit Speed Microfinance Private Limited" },
        mainEntityOfPage: `https://creditspeed.in/guides/${slug}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: g.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://creditspeed.in/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://creditspeed.in/guides" },
          { "@type": "ListItem", position: 3, name: g.h1, item: `https://creditspeed.in/guides/${slug}` },
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

      <article className="pt-36 pb-10 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-5">
            {g.eyebrow}
          </p>
          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[1.05]">
            {g.h1}
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed mt-7">{g.lede}</p>

          {g.sections.map((s) => (
            <section key={s.h} className="mt-12">
              <h2 className="font-display text-white text-2xl sm:text-3xl tracking-tighter mb-4">
                {s.h}
              </h2>
              {s.body.map((para, i) => (
                <p key={i} className="text-white/60 text-[15px] leading-[1.75] mb-4">
                  {para}
                </p>
              ))}
              {s.list && (
                <ul className="text-white/60 text-[15px] leading-[1.75] list-disc pl-6 space-y-2 mb-4">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-14 pt-10 border-t border-white/5">
            <h2 className="font-display text-white text-2xl sm:text-3xl tracking-tighter mb-8">
              Common questions
            </h2>
            <div className="space-y-7">
              {g.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="text-white text-base font-semibold mb-2">{f.q}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-14 p-7 rounded-2xl border border-white/10 text-center">
            <p className="text-white text-lg font-semibold mb-2">
              {SHOPS} partner shops across Kanpur
            </p>
            <p className="text-white/50 text-sm mb-6">
              Walk into any of them with your documents and get a decision at the counter.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/stores/kanpur"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
              >
                Find a shop near you
              </Link>
              <Link
                href="/hi"
                className="px-6 py-3 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
                lang="hi-IN"
              >
                हिंदी में पढ़ें
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
