"use client";
import { motion } from "framer-motion";
import Link from "next/link";

// href is set only where a city actually has a store page to send someone
// to. A tile that links nowhere is a dead end for a visitor and invisible to
// a crawler.
const cities: { name: string; status: string; href?: string }[] = [
  { name: "Lucknow", status: "active" },
  { name: "Kanpur", status: "active", href: "/stores/kanpur" },
  { name: "Varanasi", status: "active" },
  { name: "Agra", status: "coming" },
  { name: "Meerut", status: "coming" },
  { name: "Allahabad", status: "coming" },
  { name: "Gorakhpur", status: "coming" },
  { name: "Bareilly", status: "coming" },
];

export default function Cities() {
  return (
    <section className="bg-[#050B17] py-24 lg:py-32 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
            Our Presence
          </p>
          <h2 className="font-display text-white text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95]">
            Across<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">Uttar Pradesh.</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto text-sm">
            Starting with key cities. Expanding rapidly.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {cities.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`rounded-2xl p-5 text-center transition relative overflow-hidden ${
                city.status === "active"
                  ? "glass-strong hover:border-gold-400/30"
                  : "glass opacity-60"
              }`}
            >
              {city.status === "active" && (
                <span className="absolute top-3 right-3 flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold-400" />
                </span>
              )}
              {city.href ? (
                <Link href={city.href} className="block">
                  <p className="text-white font-display text-lg tracking-tight hover:text-gold-400 transition">
                    {city.name}
                  </p>
                </Link>
              ) : (
                <p className="text-white font-display text-lg tracking-tight">{city.name}</p>
              )}
              <p
                className={`text-[10px] mt-1 tracking-widest uppercase ${
                  city.status === "active" ? "text-gold-400" : "text-white/30"
                }`}
              >
                {city.status === "active" ? "Active" : "Coming Soon"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
