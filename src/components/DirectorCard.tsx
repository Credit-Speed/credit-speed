"use client";
import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Patrick Bateman business card — v2.
 *
 * Channels the American-Psycho card-comparison scene + Apple/Tesla restraint.
 * Front is deliberately minimal — gold-rule monogram beneath the name, full
 * stop. The richness lives on the back: engraved imagery specific to each
 * director (AI / growth / retail), bullets, contact pills.
 *
 * Click to flip. Card width matches a real ISO 7810 ID-1 ratio (1.586:1).
 */

export type EngravingTheme = "ai" | "growth" | "retail";

export type Director = {
  name: string;
  role: string;
  /** Per-director engraving on the back — picks one of the 3 SVG themes. */
  engraving: EngravingTheme;
  /** 3-5 bullets shown on the back. */
  taglines: string[];
  /** Tagline shown above the rule on front (e.g. "Director · Credit Speed"). */
  accent?: string;
  email?: string;
  linkedin?: string;
};

export default function DirectorCard({ director }: { director: Director }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="group relative w-full" style={{ perspective: "1800px" }}>
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          // Taller than the ISO 7810 ID-1 ratio (1.586) so 4-bullet backs
          // with contact pills don't clip. 1.35 gives ~30% more vertical room.
          aspectRatio: "1.35 / 1",
        }}
      >
        {/* ─────────────── FRONT ─────────────── */}
        <CardFace>
          <div className="relative h-full flex flex-col p-7 sm:p-8">
            {/* Top — small Credit Speed mark */}
            <div className="flex items-start justify-between">
              <BrandMark />
              <FlipIndicator />
            </div>

            {/* Center — name + rule + role */}
            <div className="flex-1 flex flex-col items-center justify-center text-center -mt-2">
              <h3
                className="font-display text-white text-[26px] sm:text-[30px] tracking-[0.02em] leading-none"
                style={{
                  fontWeight: 600,
                  textShadow:
                    "0 1px 0 rgba(255,255,255,0.05), 0 -1px 1px rgba(0,0,0,0.55)",
                }}
              >
                {director.name}
              </h3>

              {/* Gold engraved rule with center ornament */}
              <div className="flex items-center gap-3 mt-3 mb-3 w-full max-w-[180px]">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-gold-400/30" />
                <span
                  className="block w-1 h-1 rounded-full bg-gold-400"
                  style={{ boxShadow: "0 0 4px rgba(212,168,83,0.6)" }}
                />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold-400/60 to-gold-400/30" />
              </div>

              <p className="text-gold-400 text-[10px] tracking-[0.42em] uppercase font-medium">
                {director.role}
              </p>
            </div>

            {/* Bottom accent (just the brand line) */}
            <div className="flex items-end justify-center">
              <p className="text-[8px] tracking-[0.4em] uppercase text-white/30">
                {director.accent ?? "Credit Speed"}
              </p>
            </div>
          </div>
        </CardFace>

        {/* ─────────────── BACK ─────────────── */}
        <CardFace back>
          {/* Engraving lives in the background of the back face */}
          <Engraving theme={director.engraving} />

          <div className="relative h-full flex flex-col p-6 sm:p-7">
            {/* Top row — name compact */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white text-[12px] tracking-[0.18em] uppercase font-semibold">
                  {director.name}
                </p>
                <p className="text-gold-400 text-[9px] tracking-[0.32em] uppercase font-medium mt-1">
                  {director.role}
                </p>
              </div>
              <FlipIndicator />
            </div>

            {/* Bullets */}
            <ul className="flex-1 space-y-1.5 overflow-hidden">
              {director.taglines.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-2 text-white/80 text-[11.5px] leading-snug"
                >
                  <span
                    className="block w-px h-3 mt-1 flex-shrink-0 bg-gradient-to-b from-gold-400 to-gold-400/0"
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            {/* Footer — contact icons (only when at least one is set) */}
            {(director.linkedin || director.email) && (
              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/[0.08]">
                {director.linkedin && (
                  <ContactPill
                    href={director.linkedin}
                    label="LinkedIn"
                    icon={<LinkedInIcon />}
                  />
                )}
                {director.email && (
                  <ContactPill
                    href={`mailto:${director.email}`}
                    label="Email"
                    icon={<EmailIcon />}
                  />
                )}
              </div>
            )}
          </div>
        </CardFace>
      </motion.div>
    </div>
  );
}

/* ============================================================
   The card face — brushed black titanium with gold edge
   ============================================================ */

function CardFace({
  children,
  back,
}: {
  children: React.ReactNode;
  back?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden"
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        // Brushed black titanium with subtle warm tone
        background:
          "linear-gradient(135deg, #0c0c10 0%, #18181f 45%, #0a0a0e 100%)",
        boxShadow:
          "0 24px 60px -22px rgba(0,0,0,0.85), inset 0 1px 0 0 rgba(255,255,255,0.07), inset 0 -1px 0 0 rgba(0,0,0,0.45)",
        border: "1px solid rgba(212, 168, 83, 0.20)",
      }}
    >
      {/* Brushed-metal vertical hairlines */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* Vignette + warm gold corner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 100% 0%, rgba(212,168,83,0.10) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(212,168,83,0.05) 0%, transparent 50%)",
        }}
      />
      {/* Top-edge machined highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/45 to-transparent" />
      {/* Bottom-edge dark seam */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-black/60" />
      {/* Inner gold hairline frame, ~6px inset */}
      <div className="absolute inset-1.5 rounded-[14px] border border-gold-400/[0.06] pointer-events-none" />
      {/* Content */}
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* ============================================================
   Tiny atoms
   ============================================================ */

function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="block w-1.5 h-1.5 rounded-full"
        style={{ background: "#A6E22E", boxShadow: "0 0 5px #A6E22E" }}
      />
      <p className="text-[8px] tracking-[0.42em] uppercase text-white/45 font-medium">
        Credit Speed
      </p>
    </div>
  );
}

function FlipIndicator() {
  return (
    <div
      className="flex items-center gap-1 text-white/30 group-hover:text-gold-400/70 text-[8px] tracking-[0.22em] uppercase transition-colors"
      title="Click to flip"
    >
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 4l4 4-4 4M20 8H8a4 4 0 00-4 4v0M8 20l-4-4 4-4M4 16h12a4 4 0 004-4v0"
        />
      </svg>
      <span>Flip</span>
    </div>
  );
}

function ContactPill({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                 bg-white/[0.04] hover:bg-gold-400/15 border border-white/[0.08] hover:border-gold-400/30
                 text-white/65 hover:text-gold-300 text-[9px] tracking-[0.18em] uppercase font-medium
                 transition-colors"
    >
      <span className="w-3 h-3">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-full h-full"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

/* ============================================================
   Engravings — per-director SVG art baked into the back face
   ============================================================ */

function Engraving({ theme }: { theme: EngravingTheme }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {theme === "ai" && <AIEngraving />}
      {theme === "growth" && <GrowthEngraving />}
      {theme === "retail" && <RetailEngraving />}
    </div>
  );
}

/** AI / circuit / horse / camera — Ravindra's interests engraved in metal. */
function AIEngraving() {
  return (
    <svg
      viewBox="0 0 400 296"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      fill="none"
    >
      {/* Soft inner glow */}
      <radialGradient id="aiGlow" cx="80%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#D4A853" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
      </radialGradient>
      <rect width="400" height="296" fill="url(#aiGlow)" />

      {/* Circuit network — bottom right cluster */}
      <g
        stroke="#D4A853"
        strokeOpacity="0.18"
        strokeWidth="0.6"
        fill="#D4A853"
        fillOpacity="0.18"
      >
        {/* Lines */}
        <line x1="240" y1="200" x2="290" y2="160" />
        <line x1="290" y1="160" x2="350" y2="180" />
        <line x1="290" y1="160" x2="320" y2="120" />
        <line x1="320" y1="120" x2="370" y2="140" />
        <line x1="240" y1="200" x2="270" y2="230" />
        <line x1="320" y1="120" x2="340" y2="80" />
        <line x1="370" y1="140" x2="390" y2="100" />
        {/* Nodes */}
        <circle cx="240" cy="200" r="2" />
        <circle cx="290" cy="160" r="2.5" />
        <circle cx="350" cy="180" r="1.6" />
        <circle cx="320" cy="120" r="2" />
        <circle cx="370" cy="140" r="1.6" />
        <circle cx="270" cy="230" r="1.6" />
        <circle cx="340" cy="80" r="2" />
        <circle cx="390" cy="100" r="1.6" />
      </g>

      {/* Horse silhouette — top right, very subtle */}
      <g fill="#D4A853" fillOpacity="0.07" transform="translate(290, 30)">
        <path d="M 50 30 C 48 25 52 20 56 22 C 60 18 66 20 68 26 L 70 30 L 76 28 L 78 36 L 70 38 L 68 50 L 64 60 L 60 65 L 58 75 L 54 75 L 56 65 L 52 55 L 48 60 L 44 70 L 40 72 L 42 60 L 46 50 L 44 40 L 38 38 L 36 30 L 42 28 Z" />
      </g>

      {/* Cinematic camera silhouette — bottom left */}
      <g
        fill="none"
        stroke="#D4A853"
        strokeOpacity="0.12"
        strokeWidth="0.8"
        transform="translate(20, 175)"
      >
        <rect x="0" y="8" width="40" height="22" rx="2" />
        <rect x="40" y="14" width="14" height="10" />
        <circle cx="14" cy="19" r="4" />
        <circle cx="28" cy="19" r="2" />
        <rect x="2" y="2" width="12" height="6" />
      </g>

      {/* Faded "MOSS PILOT" mark — bottom-right corner */}
      <text
        x="380"
        y="240"
        textAnchor="end"
        fontFamily="Inter, sans-serif"
        fontSize="6"
        fontWeight="700"
        letterSpacing="3"
        fill="#D4A853"
        fillOpacity="0.18"
      >
        MOSS PILOT
      </text>
    </svg>
  );
}

/** Growth chart + geometric — Yashwant's sales / scale theme. */
function GrowthEngraving() {
  return (
    <svg
      viewBox="0 0 400 296"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      fill="none"
    >
      <radialGradient id="grGlow" cx="100%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#D4A853" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
      </radialGradient>
      <rect width="400" height="296" fill="url(#grGlow)" />

      {/* Hexagon grid pattern, top-right corner */}
      <g
        stroke="#D4A853"
        strokeOpacity="0.10"
        strokeWidth="0.5"
        fill="none"
      >
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const cx = 280 + col * 26;
            const cy = 30 + row * 22 + (col % 2 === 1 ? 11 : 0);
            return (
              <polygon
                key={`${row}-${col}`}
                points={`${cx},${cy - 12} ${cx + 10},${cy - 6} ${cx + 10},${cy + 6} ${cx},${cy + 12} ${cx - 10},${cy + 6} ${cx - 10},${cy - 6}`}
              />
            );
          })
        )}
      </g>

      {/* Rising growth curve, bottom right */}
      <g fill="none" stroke="#D4A853" strokeOpacity="0.25" strokeWidth="1.2">
        <path
          d="M 220 215 L 250 195 L 280 200 L 310 165 L 340 140 L 380 90"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* End arrow */}
        <path d="M 380 90 L 372 96 M 380 90 L 374 100" strokeLinecap="round" />
        {/* Data points */}
        <circle cx="250" cy="195" r="1.8" fill="#D4A853" fillOpacity="0.4" />
        <circle cx="280" cy="200" r="1.8" fill="#D4A853" fillOpacity="0.4" />
        <circle cx="310" cy="165" r="1.8" fill="#D4A853" fillOpacity="0.4" />
        <circle cx="340" cy="140" r="1.8" fill="#D4A853" fillOpacity="0.4" />
      </g>

      {/* Vertical bar chart, bottom left, very subtle */}
      <g fill="#D4A853" fillOpacity="0.10">
        <rect x="20" y="220" width="6" height="20" />
        <rect x="32" y="210" width="6" height="30" />
        <rect x="44" y="195" width="6" height="45" />
        <rect x="56" y="180" width="6" height="60" />
        <rect x="68" y="160" width="6" height="80" />
      </g>

      {/* Faded "REAL FINSERV" mark — bottom-right */}
      <text
        x="380"
        y="240"
        textAnchor="end"
        fontFamily="Inter, sans-serif"
        fontSize="6"
        fontWeight="700"
        letterSpacing="3"
        fill="#D4A853"
        fillOpacity="0.18"
      >
        REAL FINSERV
      </text>
    </svg>
  );
}

/** Retail / storefront / rupee / network — Prakash's domain. */
function RetailEngraving() {
  return (
    <svg
      viewBox="0 0 400 296"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      fill="none"
    >
      <radialGradient id="rtGlow" cx="100%" cy="0%" r="80%">
        <stop offset="0%" stopColor="#D4A853" stopOpacity="0.10" />
        <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
      </radialGradient>
      <rect width="400" height="296" fill="url(#rtGlow)" />

      {/* Storefront silhouettes — bottom right (3 shops in a row) */}
      <g
        fill="none"
        stroke="#D4A853"
        strokeOpacity="0.18"
        strokeWidth="0.7"
        transform="translate(220, 150)"
      >
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 50}, 0)`}>
            {/* Awning */}
            <path d="M 0 25 L 8 15 L 32 15 L 40 25 Z" />
            {/* Body */}
            <rect x="3" y="25" width="34" height="50" />
            {/* Door */}
            <rect x="14" y="50" width="12" height="25" />
            {/* Window */}
            <rect x="6" y="32" width="8" height="10" />
            <rect x="26" y="32" width="8" height="10" />
            {/* Roof line */}
            <line x1="0" y1="25" x2="40" y2="25" strokeOpacity="0.3" />
          </g>
        ))}
      </g>

      {/* Network / connection nodes — top right */}
      <g
        stroke="#D4A853"
        strokeOpacity="0.16"
        strokeWidth="0.5"
        fill="#D4A853"
        fillOpacity="0.16"
      >
        <line x1="290" y1="40" x2="330" y2="60" />
        <line x1="330" y1="60" x2="370" y2="40" />
        <line x1="330" y1="60" x2="350" y2="100" />
        <line x1="290" y1="40" x2="270" y2="80" />
        <line x1="270" y1="80" x2="310" y2="100" />
        <line x1="310" y1="100" x2="350" y2="100" />
        <circle cx="290" cy="40" r="2" />
        <circle cx="330" cy="60" r="2.5" />
        <circle cx="370" cy="40" r="1.6" />
        <circle cx="270" cy="80" r="1.6" />
        <circle cx="310" cy="100" r="2" />
        <circle cx="350" cy="100" r="1.6" />
      </g>

      {/* Indian rupee symbol — bottom left, large but faded */}
      <text
        x="40"
        y="220"
        fontFamily="Inter, sans-serif"
        fontSize="80"
        fontWeight="600"
        fill="#D4A853"
        fillOpacity="0.05"
      >
        ₹
      </text>

      {/* Subtle compass/circle (UP map nod) bottom-center */}
      <g
        fill="none"
        stroke="#D4A853"
        strokeOpacity="0.08"
        strokeWidth="0.5"
        transform="translate(160, 180)"
      >
        <circle cx="0" cy="0" r="22" />
        <circle cx="0" cy="0" r="14" />
        <line x1="-22" y1="0" x2="22" y2="0" />
        <line x1="0" y1="-22" x2="0" y2="22" />
      </g>

      {/* Faded "BHARAT" mark — bottom-right */}
      <text
        x="380"
        y="240"
        textAnchor="end"
        fontFamily="Inter, sans-serif"
        fontSize="6"
        fontWeight="700"
        letterSpacing="3"
        fill="#D4A853"
        fillOpacity="0.18"
      >
        BHARAT
      </text>
    </svg>
  );
}
