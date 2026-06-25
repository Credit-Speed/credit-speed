import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#030710] border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid md:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo variant="lockup" size="md" />
            <p className="text-white/45 text-sm mt-5 max-w-xs leading-relaxed">
              Empowering mobile retailers across UP with instant smartphone EMI financing.
            </p>
            <div className="flex gap-2 mt-6">
              {["linkedin", "twitter", "instagram", "facebook"].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-gold-400 hover:border-gold-400/30 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white/30 text-[10px] font-semibold tracking-[0.25em] uppercase mb-5">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-white/65 hover:text-gold-400 text-sm transition">About Us</Link></li>
              <li><Link href="/partner" className="text-white/65 hover:text-gold-400 text-sm transition">For Retailers</Link></li>
              <li><Link href="/stores" className="text-white/65 hover:text-gold-400 text-sm transition">Store Locator</Link></li>
              <li><Link href="/contact" className="text-white/65 hover:text-gold-400 text-sm transition">Contact</Link></li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-white/30 text-[10px] font-semibold tracking-[0.25em] uppercase mb-5">For Users</h4>
            <ul className="space-y-3">
              <li><Link href="/stores" className="text-white/65 hover:text-gold-400 text-sm transition">Find a Store</Link></li>
              <li>
                <a
                  href="https://signup.oroboro.in/AgentOnboard/KycRegistration?params=OSgZ0NA5ls0=&LoanType=AgentOnboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-gold-400 text-sm transition"
                >
                  Merchant Login
                </a>
              </li>
              <li>
                <a
                  href="https://signup.oroboro.in/AgentOnboard/KycRegistration?params=OSgZ0NA5ls0=&LoanType=AgentOnboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/65 hover:text-gold-400 text-sm transition"
                >
                  Become a Merchant
                </a>
              </li>
              <li><Link href="/partner" className="text-white/65 hover:text-gold-400 text-sm transition">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Legal + Reach */}
          <div>
            <h4 className="text-white/30 text-[10px] font-semibold tracking-[0.25em] uppercase mb-5">Legal</h4>
            <ul className="space-y-3 mb-7">
              <li><Link href="/privacy" className="text-white/65 hover:text-gold-400 text-sm transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/65 hover:text-gold-400 text-sm transition">Terms of Service</Link></li>
            </ul>

            <h4 className="text-white/30 text-[10px] font-semibold tracking-[0.25em] uppercase mb-4">Reach Us</h4>
            <div className="space-y-2.5">
              <a href="mailto:admin@creditspeed.in" className="flex items-center gap-2 text-white/65 hover:text-gold-400 text-xs transition break-all">
                <svg className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                admin@creditspeed.in
              </a>
              <a href="tel:+918824920949" className="flex items-center gap-2 text-white/65 hover:text-gold-400 text-xs transition">
                <svg className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2l2 5-3 2a11 11 0 006 6l2-3 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" />
                </svg>
                +91 88249 20949
              </a>
              <a href="https://wa.me/918824920949" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/65 hover:text-[#25D366] text-xs transition">
                <svg className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.107zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                Chat on WhatsApp
              </a>
              <p className="flex items-start gap-2 text-white/55 text-xs">
                <svg className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-8 8-13a8 8 0 10-16 0c0 5 8 13 8 13z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                Office address opening soon
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/35 text-xs">
              &copy; 2026 Credit Speed Microfinance Private Limited.
            </p>
            <p className="text-white/30 text-xs max-w-xl text-center sm:text-right">
              Loans provided by RBI-registered NBFC partners. Credit Speed is a technology platform; does not directly lend.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
