"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050B17]">
      {/* Cinematic glow background */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute right-[-20%] top-1/4 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,83,0.25) 0%, rgba(212,168,83,0.08) 40%, transparent 70%)",
        }}
      />
      {/* Streaks of light — horizontal */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/3 left-0 right-0 h-px opacity-40"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.6) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-2/3 left-0 right-0 h-px opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent 20%, rgba(212,168,83,0.4) 60%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-36 pb-20 lg:pt-44 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left — Display Headline */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 relative z-10"
          >
            <motion.h1
              variants={item}
              className="font-display text-white leading-[0.92] tracking-tighter"
              style={{ fontSize: "clamp(3.5rem, 9vw, 9rem)" }}
            >
              BIG<br />DREAMS.
              <br />
              <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
                SMALL EMI.
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-8 text-white/60 text-base sm:text-lg max-w-md leading-relaxed"
            >
              Walk in. Walk out with the phone. Pay in easy monthly installments —
              minimal documentation, instant approval.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex items-center gap-4">
              {/* Start Now pill with thumbnail-style icon */}
              <Link
                href="https://signup.oroboro.in/AgentOnboard/KycRegistration?params=OSgZ0NA5ls0=&LoanType=AgentOnboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-white pl-1.5 pr-7 py-1.5 rounded-full hover:bg-gold-200 transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-500 font-bold text-sm shadow-inner">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <span className="text-navy-500 font-semibold text-sm">Start Now</span>
              </Link>

              <Link
                href="/partner"
                className="text-white/70 hover:text-white text-sm font-medium border-b border-white/20 hover:border-gold-400 pb-1 transition"
              >
                For Retailers →
              </Link>
            </motion.div>

            {/* Tiny "Now in UP" status badge */}
            <motion.div
              variants={item}
              className="mt-8 inline-flex items-center gap-2 text-xs text-white/50"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold-400" />
              </span>
              <span className="tracking-widest uppercase">Now live in Uttar Pradesh</span>
            </motion.div>
          </motion.div>

          {/* Right — Phone + glass telemetry */}
          <div className="lg:col-span-5 relative h-[640px]">
            <PhoneWithTelemetry />
          </div>
        </div>

        {/* Scroll indicator — bottom-left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-8 left-6 lg:left-12 flex items-center gap-3 text-white/40 text-xs"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
          <span className="tracking-wider">
            <span className="text-white/70 font-medium">Scroll</span> to explore
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Phone subject + glass telemetry callouts ---------- */

function PhoneWithTelemetry() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="absolute inset-0"
    >
      {/* Connecting lines — drawn UNDER the cards */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 500 640"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#D4A853" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Approved 50K -> upper-left phone edge */}
        <motion.path
          d="M 50 90 Q 140 90 200 200"
          stroke="url(#goldLine)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
        />
        <circle cx="200" cy="200" r="3" fill="#D4A853" />

        {/* 5 Min Decision -> upper-right */}
        <motion.path
          d="M 460 130 Q 380 150 320 220"
          stroke="url(#goldLine)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        />
        <circle cx="320" cy="220" r="3" fill="#D4A853" />

        {/* Same-day pickup -> lower-right */}
        <motion.path
          d="M 470 480 Q 380 480 310 440"
          stroke="url(#goldLine)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="3 3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
        />
        <circle cx="310" cy="440" r="3" fill="#D4A853" />
      </svg>

      {/* Phone — center, slight tilt */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ transform: "translate(-50%, -50%) rotate(-4deg)" }}
      >
        <div
          className="relative w-[260px] h-[540px] rounded-[2.5rem] p-2 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #2a3654 0%, #0F1B33 100%)",
            boxShadow:
              "0 30px 80px -20px rgba(212, 168, 83, 0.35), 0 0 0 1px rgba(212, 168, 83, 0.1) inset",
          }}
        >
          {/* Inner screen */}
          <div className="w-full h-full rounded-[2rem] overflow-hidden flex flex-col items-center justify-center p-7 relative"
            style={{ background: "linear-gradient(180deg, #050B17 0%, #0A1628 100%)" }}
          >
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />

            {/* Apna Score visualization in screen */}
            <div className="flex flex-col items-center mt-6">
              <p className="text-white/40 text-[10px] font-medium tracking-[0.25em] uppercase mb-5">
                Apna Score
              </p>
              <div className="relative">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="#D4A853"
                    strokeWidth="6"
                    strokeDasharray="552.92"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 552.92 }}
                    animate={{ strokeDashoffset: 110 }}
                    transition={{ duration: 2.2, delay: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    className="text-white text-5xl font-bold tracking-tight"
                  >
                    742
                  </motion.span>
                  <span className="text-gold-400 text-[10px] font-medium tracking-widest mt-1">
                    EXCELLENT
                  </span>
                </div>
              </div>
            </div>

            {/* Active EMI mini card on screen */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="w-full mt-6 glass-strong rounded-2xl p-3.5"
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-white/40 text-[9px] font-semibold tracking-widest uppercase">
                  Active EMI
                </span>
                <span className="text-white/60 text-[9px] font-medium">3/12</span>
              </div>
              <p className="text-white font-bold text-sm mb-2">Samsung S24</p>
              <div className="w-full bg-white/8 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="bg-gold-400 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "25%" }}
                  transition={{ delay: 2, duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Telemetry card 1 — Approved ₹50K (upper left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="absolute left-2 top-12 z-20 glass-strong rounded-2xl px-4 py-3 w-[170px]"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/50 text-[10px] font-medium tracking-wider uppercase">Approved</p>
        </div>
        <p className="text-white font-display text-2xl tracking-tight">₹35,000</p>
        <p className="text-white/40 text-[10px] mt-0.5">pre-approved limit</p>
      </motion.div>

      {/* Telemetry card 2 — 5 Min Decision (upper right) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="absolute right-2 top-24 z-20 glass-strong rounded-2xl px-4 py-3 w-[160px]"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center relative">
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <svg className="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white/50 text-[10px] font-medium tracking-wider uppercase">Decision</p>
        </div>
        <p className="text-white font-display text-2xl tracking-tight">5 Min</p>
        <p className="text-white/40 text-[10px] mt-0.5">real-time approval</p>
      </motion.div>

      {/* Telemetry card 3 — Same Day Pickup (lower right) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.0 }}
        className="absolute right-2 bottom-16 z-20 glass-strong rounded-2xl px-4 py-3 w-[170px]"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6m-9 6l-9 6h18l-9-6z" />
            </svg>
          </div>
          <p className="text-white/50 text-[10px] font-medium tracking-wider uppercase">Pickup</p>
        </div>
        <p className="text-white font-display text-2xl tracking-tight">Same Day</p>
        <p className="text-white/40 text-[10px] mt-0.5">walk in, walk out</p>
      </motion.div>
    </motion.div>
  );
}
