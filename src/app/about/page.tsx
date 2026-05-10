import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DirectorCard, { Director } from "@/components/DirectorCard";

const directors: Director[] = [
  {
    name: "Ravindra Singh",
    role: "Director",
    engraving: "ai",
    accent: "Credit Speed · Bharat",
    taglines: [
      "Founder of Moss Pilot — Generative AI optimisation studio",
      "AI developer, product engineer, technology architect",
      "Builds technology-driven brands and scalable AI systems",
      "Cinematographer and horse-rider in his off-hours",
    ],
    email: "ravindrasingh252001@gmail.com",
    linkedin: "https://www.linkedin.com/in/ravindra-singh-528838185/",
  },
  {
    name: "Yashwant Sharma",
    role: "Director",
    engraving: "growth",
    accent: "Credit Speed · Bharat",
    taglines: [
      "Sales and marketing strategist",
      "Co-Founder of Moss Pilot",
      "Director of Real Finserv Operations, Jaipur",
      "Scales companies through smart leadership and operational excellence",
    ],
  },
  {
    name: "Prakash Mali",
    role: "Director",
    engraving: "retail",
    accent: "Credit Speed · Bharat",
    taglines: [
      "Director of Credit Kuber Microfinance",
      "Deep expertise in retail finance and merchant operations",
      "Architect of Credit Speed's tier-2 / tier-3 expansion strategy",
      "Built the partner network powering smartphone EMI in Bharat",
    ],
  },
];

const values = [
  { title: "Trust", description: "Transparent partnerships built on integrity." },
  { title: "Speed", description: "24-hour turnaround for approvals and onboarding." },
  { title: "Empowerment", description: "Equipping retailers with tools to win." },
  { title: "Transparency", description: "Clear terms. No hidden fees." },
  { title: "Innovation", description: "Tech-enabled accessible financing." },
  { title: "Collaboration", description: "Strong partnerships with merchants and NBFCs." },
];

const timeline = [
  { year: "2026", title: "Founded", description: "Credit Speed Microfinance Pvt Ltd incorporated in UP." },
  { year: "2026", title: "Launch", description: "Live across Lucknow, Kanpur, Varanasi with 500+ retailers." },
  { year: "2027", title: "Scale", description: "10+ UP cities, 2,000+ retailer network." },
  { year: "Future", title: "Nationwide", description: "India's most trusted smartphone EMI platform." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050B17] min-h-screen">
        {/* Hero */}
        <section className="pt-36 pb-20 px-6 lg:px-12 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 60%)" }}
          />
          <p className="relative text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-5">
            About Us
          </p>
          <h1 className="relative font-display text-white text-5xl sm:text-7xl lg:text-8xl tracking-tighter leading-[0.95] max-w-5xl mx-auto">
            Building<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
              smartphone finance
            </span>
            <br />for Bharat.
          </h1>
        </section>

        {/* Story + Timeline */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
                Our Story
              </p>
              <h2 className="font-display text-white text-4xl sm:text-5xl tracking-tighter leading-[0.95] mb-7">
                Finance that reaches every corner.
              </h2>
              <div className="space-y-5 text-white/55 text-sm leading-relaxed max-w-md">
                <p>
                  In Uttar Pradesh, millions walk into mobile shops every day dreaming of a new smartphone — but most can&apos;t pay upfront and don&apos;t have credit cards.
                </p>
                <p>
                  Credit Speed Microfinance was founded to close that gap. We partner with mobile retailers across UP and connect them with RBI-registered NBFCs.
                </p>
                <p>
                  Our mission: make EMI financing instant, transparent, and accessible — one retailer, one customer, one smartphone at a time.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {timeline.map((item, i) => (
                <div key={item.year} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 glass-strong rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-gold-400 text-[10px] font-bold tracking-wider">
                        {item.year}
                      </span>
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-gold-400/30 via-white/10 to-transparent my-2" />
                    )}
                  </div>
                  <div className="pb-7 pt-2">
                    <h3 className="font-display text-white text-xl tracking-tight mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-white/45 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission + Vision */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-5">
            {[
              {
                label: "Mission",
                body: "To empower every mobile retailer in UP with tools, tech, and financial partnerships to offer instant, reliable smartphone EMI finance.",
                iconPath: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z",
              },
              {
                label: "Vision",
                body: "To become UP's most trusted smartphone finance platform, expanding across India to enable financial inclusion for every retailer.",
                iconPath: "M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z",
              },
            ].map((b) => (
              <div key={b.label} className="glass-strong rounded-3xl p-9">
                <div className="w-11 h-11 bg-gold-400/10 border border-gold-400/15 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.iconPath} />
                  </svg>
                </div>
                <p className="text-gold-400/80 text-[10px] font-semibold tracking-[0.25em] uppercase mb-3">
                  {b.label}
                </p>
                <p className="font-display text-white text-2xl leading-snug tracking-tight">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
                What We Stand For
              </p>
              <h2 className="font-display text-white text-5xl sm:text-6xl tracking-tighter leading-[0.95]">
                Core values.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {values.map((v) => (
                <div key={v.title} className="glass rounded-2xl p-7 hover:border-gold-400/25 transition-colors">
                  <h3 className="font-display text-white text-xl tracking-tight mb-2">{v.title}</h3>
                  <p className="text-white/45 text-sm">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Directors — Patrick Bateman metal cards */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5 relative overflow-hidden">
          {/* Ambient gold glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 pointer-events-none blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 60%)",
            }}
          />

          <div className="max-w-[1400px] mx-auto relative">
            <div className="text-center mb-14">
              <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
                Leadership
              </p>
              <h2 className="font-display text-white text-5xl sm:text-6xl tracking-tighter leading-[0.95]">
                The board.
              </h2>
              <p className="text-white/55 mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
                The directors steering Credit Speed. Click any card to see their work — front for the introduction, back for the full story.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {directors.map((d) => (
                <DirectorCard key={d.name} director={d} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 lg:px-12 border-t border-white/5 text-center">
          <h2 className="font-display text-white text-5xl sm:text-6xl tracking-tighter leading-[0.95] mb-6">
            Join us in<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">transforming UP.</span>
          </h2>
          <p className="text-white/45 mb-10 max-w-md mx-auto text-sm">
            Retailer, customer, or NBFC — there&apos;s a place for you in our ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/partner"
              className="bg-white hover:bg-gold-200 text-navy-500 px-8 py-3 rounded-full font-semibold text-sm transition"
            >
              Become a Partner
            </Link>
            <Link
              href="/contact"
              className="glass text-white hover:border-gold-400/30 px-8 py-3 rounded-full font-semibold text-sm transition"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
