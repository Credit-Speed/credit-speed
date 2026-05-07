"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/partner", label: "For Retailers" },
  { href: "/stores", label: "Stores" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-4 lg:top-6 left-0 right-0 z-50 px-4 lg:px-8 font-apple">
      <div className="max-w-[1400px] mx-auto">
        <div
          className={`flex items-center justify-between gap-2 px-2.5 lg:px-3 py-2.5 rounded-full transition-all duration-500 ${
            scrolled ? "nav-glass-scrolled" : "nav-glass"
          }`}
        >
          {/* Logo */}
          <div className="pl-2 pr-3 flex-shrink-0">
            <Logo variant="lockup" size="sm" />
          </div>

          {/* Center nav with bubble hover (uses LayoutGroup so the bubble morphs between items) */}
          <LayoutGroup>
            <div
              className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2"
              onMouseLeave={() => setHoveredHref(null)}
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isHovered = hoveredHref === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setHoveredHref(link.href)}
                    className="relative px-5 py-2.5 text-[15px] font-medium tracking-tight"
                  >
                    {/* Active solid pill (gold) */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-gold-300 to-gold-500"
                        style={{
                          boxShadow:
                            "0 4px 18px -4px rgba(212,168,83,0.55), inset 0 1px 0 0 rgba(255,255,255,0.25)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {/* Hover bubble (only when not active) */}
                    {isHovered && !isActive && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-white/[0.09] border border-white/[0.06]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive
                          ? "text-navy-500 font-semibold"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </LayoutGroup>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle (sun/moon) */}
            <ThemeToggle />

            {/* Language toggle — round, hover bubble */}
            <button className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-white/65 hover:text-white text-[13px] font-medium transition-all rounded-full hover:bg-white/[0.08]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
              </svg>
              EN
            </button>

            {/* Retailer Login CTA — Apple-style frosted button */}
            <Link
              href="https://signup.oroboro.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 bg-white hover:bg-gold-100 text-navy-500 px-5 py-2 rounded-full text-[14px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_4px_14px_-2px_rgba(255,255,255,0.15)]"
            >
              Retailer Login
            </Link>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-white p-2 rounded-full hover:bg-white/[0.08] transition"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 nav-glass-scrolled rounded-3xl p-3 space-y-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-[15px] font-medium transition ${
                  pathname === link.href
                    ? "text-navy-500 bg-gradient-to-b from-gold-300 to-gold-500 font-semibold"
                    : "text-white/85 hover:bg-white/[0.08]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="https://signup.oroboro.in/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block bg-white text-navy-500 px-5 py-3 rounded-full text-[14px] font-semibold text-center mt-3"
            >
              Retailer Login
            </Link>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
