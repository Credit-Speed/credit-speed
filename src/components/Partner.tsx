"use client";
import { motion } from "framer-motion";

const cards = [
  {
    title: "NBFC Partners",
    desc: "RBI-registered NBFCs with strong regulatory compliance.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    title: "Secure & Compliant",
    desc: "RBI guidelines. Encrypted data. Enterprise-grade.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Growing Network",
    desc: "Lucknow. Kanpur. Varanasi. Expanding across UP.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

export default function Partner() {
  return (
    <section id="partner" className="bg-[#050B17] py-24 lg:py-32 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
            Partner With Us
          </p>
          <h2 className="font-display text-white text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95]">
            Built on strong<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
              partnerships.
            </span>
          </h2>
          <p className="text-white/45 mt-5 max-w-xl mx-auto text-sm">
            Credit Speed works with RBI-registered NBFCs to bring secure, compliant smartphone financing to UP.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-7 text-center hover:border-gold-400/25 transition-colors"
            >
              <div className="w-12 h-12 bg-gold-400/10 border border-gold-400/15 rounded-xl flex items-center justify-center mx-auto mb-5 text-gold-400">
                {c.icon}
              </div>
              <h3 className="font-display text-white text-xl tracking-tight mb-2">{c.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
