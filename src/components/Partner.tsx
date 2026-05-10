"use client";
import { motion } from "framer-motion";

type PartnerCard = {
  badge: string;
  name: string;
  body: string;
  quote: string;
  cta: { label: string; href: string };
  icon: React.ReactNode;
};

const partners: PartnerCard[] = [
  {
    badge: "NBFC Partner",
    name: "Transwarranty Finance Ltd.",
    body:
      "Transwarranty Finance Ltd. is our RBI-registered NBFC partner — Reg No. B-13.00971, listed on NSE & BSE since 2007. They power every Credit Speed EMI loan with capital, regulatory cover, and 30+ years of financial-services expertise.",
    quote: "Empowering seamless EMI lending through trusted financial partnerships.",
    cta: { label: "Visit Transwarranty Finance", href: "https://www.transwarranty.com/" },
    // Bank/building icon
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
        />
      </svg>
    ),
  },
  {
    badge: "Digital Loan Platform",
    name: "Oroboro",
    body:
      "Oroboro is the embedded-finance platform owned and operated by Transwarranty. It powers Credit Speed's real-time loan processing, paperless KYC, instant credit decisioning, and the merchant + customer dashboards.",
    quote: "Integrating fintech innovation for instant approvals.",
    cta: { label: "Explore Oroboro", href: "https://loan.oroboro.in/about.html" },
    // Network/nodes icon
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
    ),
  },
];

export default function Partner() {
  return (
    <section
      id="partner"
      className="bg-[#050B17] py-24 lg:py-32 border-t border-white/5 relative overflow-hidden"
    >
      {/* Ambient gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
            Our Trusted Partners
          </p>
          <h2 className="font-display text-white text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95]">
            Built on strong<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
              partnerships.
            </span>
          </h2>
          <p className="text-white/55 mt-6 max-w-xl mx-auto text-[15px] leading-relaxed">
            The financial foundation that powers every Credit Speed EMI loan and merchant onboarding.
          </p>
        </motion.div>

        {/* Two-up partner cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {partners.map((p, i) => (
            <motion.a
              key={p.name}
              href={p.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="group relative glass rounded-3xl p-7 lg:p-9 hover:border-gold-400/30 transition-colors flex flex-col"
            >
              {/* Top edge highlight */}
              <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Icon + badge */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-gold-400/10 border border-gold-400/15 rounded-xl flex items-center justify-center text-gold-400 flex-shrink-0">
                  {p.icon}
                </div>
                <div className="pt-1">
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-gold-400/80">
                    {p.badge}
                  </p>
                  <h3 className="font-display text-white text-2xl lg:text-[28px] tracking-tight mt-1 leading-tight">
                    {p.name}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <p className="text-white/65 text-[14.5px] leading-relaxed mb-6 flex-1">
                {p.body}
              </p>

              {/* Pull quote */}
              <div className="border-l-2 border-gold-400/60 pl-4 py-2 mb-6">
                <p className="text-white/85 text-[13.5px] italic leading-relaxed">
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>

              {/* CTA row */}
              <div className="flex items-center justify-between text-gold-400 text-sm font-semibold pt-2 border-t border-white/[0.06]">
                <span className="group-hover:text-gold-300 transition-colors">
                  {p.cta.label}
                </span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
