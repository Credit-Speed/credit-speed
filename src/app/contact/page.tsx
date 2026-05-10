"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Contact details — single source of truth
const CONTACT = {
  email: "admin@creditspeed.in",
  phoneDisplay: "+91 88249 20949",
  phoneIntl: "+918824920949",
  whatsappNumber: "918824920949", // no '+' for wa.me URLs
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    subject: "",
    message: "",
  });

  // Build the message text reused by both WhatsApp and email handlers
  const buildMessageBody = () => {
    const lines = [
      `*New inquiry from creditspeed.in*`,
      ``,
      `*Name:* ${form.name || "—"}`,
      `*Email:* ${form.email || "—"}`,
      `*Phone:* ${form.phone || "—"}`,
      `*Role:* ${form.role || "—"}`,
      `*Subject:* ${form.subject || "—"}`,
      ``,
      `*Message:*`,
      form.message || "—",
    ];
    return lines.join("\n");
  };

  // Primary submit → WhatsApp click-to-chat (free, instant, no backend)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(buildMessageBody());
    window.open(
      `https://wa.me/${CONTACT.whatsappNumber}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Fallback → mailto: opens user's default email client
  const handleEmailSend = () => {
    const subject = encodeURIComponent(
      form.subject ? `[${form.subject}] from ${form.name || "website"}` : "Inquiry from creditspeed.in"
    );
    const body = encodeURIComponent(buildMessageBody().replace(/\*/g, ""));
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold-400 transition placeholder:text-white/30";
  const labelClass = "text-white/60 text-xs font-medium tracking-wider uppercase block mb-2";

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
            Contact Us
          </p>
          <h1 className="relative font-display text-white text-5xl sm:text-7xl lg:text-8xl tracking-tighter leading-[0.95] max-w-4xl mx-auto mb-6">
            Get in<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">touch.</span>
          </h1>
          <p className="relative text-white/55 text-sm">
            We typically respond within 1 hour.
          </p>
        </section>

        {/* Content */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-5 gap-6 lg:gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-7 sm:p-10">
                <h2 className="font-display text-white text-2xl tracking-tight mb-7">Send us a message</h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input required name="name" value={form.name} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input required type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>I am a...</label>
                    <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
                      <option value="" className="bg-navy-500">Select role</option>
                      <option className="bg-navy-500">Mobile Retailer</option>
                      <option className="bg-navy-500">Customer</option>
                      <option className="bg-navy-500">NBFC Partner</option>
                      <option className="bg-navy-500">Media / Press</option>
                      <option className="bg-navy-500">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange} className={inputClass}>
                      <option value="" className="bg-navy-500">Select subject</option>
                      <option className="bg-navy-500">General Inquiry</option>
                      <option className="bg-navy-500">Partnership</option>
                      <option className="bg-navy-500">Customer Support</option>
                      <option className="bg-navy-500">Feedback &amp; Suggestions</option>
                      <option className="bg-navy-500">Career Opportunities</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Message *</label>
                    <textarea required name="message" value={form.message} onChange={handleChange} rows={5} className={`${inputClass} resize-none`} />
                  </div>
                </div>

                {/* Dual delivery: WhatsApp (primary) + Email (fallback) */}
                <div className="grid sm:grid-cols-2 gap-3 mt-7">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20B358] text-white py-3.5 rounded-full font-semibold text-sm transition shadow-[0_4px_18px_-4px_rgba(37,211,102,0.5)]"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.107zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Send via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailSend}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gold-100 text-navy-500 py-3.5 rounded-full font-semibold text-sm transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send via Email
                  </button>
                </div>
                <p className="text-white/35 text-[11px] text-center mt-4 leading-relaxed">
                  WhatsApp opens an instant chat with us. Email opens your mail client.
                </p>
              </form>
            </div>

            {/* Contact cards */}
            <div className="lg:col-span-2 space-y-3">
              <a href={`tel:${CONTACT.phoneIntl}`} className="block glass-strong rounded-2xl p-6 hover:border-gold-400/30 transition">
                <div className="w-10 h-10 bg-gold-400/15 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2l2 5-3 2a11 11 0 006 6l2-3 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" />
                  </svg>
                </div>
                <h3 className="font-display text-white text-lg tracking-tight mb-1">Call Us</h3>
                <p className="text-white/70 text-sm font-medium">{CONTACT.phoneDisplay}</p>
                <p className="text-gold-400 text-[10px] mt-2 font-medium tracking-widest uppercase">Tap to dial</p>
              </a>

              <a href={`mailto:${CONTACT.email}`} className="block glass rounded-2xl p-6 hover:border-gold-400/30 transition">
                <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-white text-lg tracking-tight mb-1">Email Us</h3>
                <p className="text-white/70 text-sm font-medium break-all">{CONTACT.email}</p>
                <p className="text-gold-400 text-[10px] mt-2 font-medium tracking-widest uppercase">We reply fast</p>
              </a>

              <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="block glass rounded-2xl p-6 hover:border-[#25D366]/40 transition">
                <div className="w-10 h-10 bg-[#25D366]/15 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.107zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <h3 className="font-display text-white text-lg tracking-tight mb-1">WhatsApp</h3>
                <p className="text-white/70 text-sm font-medium">{CONTACT.phoneDisplay}</p>
                <p className="text-[#25D366] text-[10px] mt-2 font-medium tracking-widest uppercase">Chat instantly →</p>
              </a>

              <div className="glass rounded-2xl p-6">
                <div className="w-10 h-10 bg-gold-400/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-8 8-13a8 8 0 10-16 0c0 5 8 13 8 13z" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                </div>
                <h3 className="font-display text-white text-lg tracking-tight mb-1">Visit Us</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Office address<br />opening soon
                </p>
                <p className="text-gold-400 text-[10px] mt-2 font-medium tracking-widest uppercase">Uttar Pradesh, India</p>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="max-w-5xl mx-auto mt-14 glass-strong rounded-3xl p-7">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-display text-white text-4xl sm:text-5xl tracking-tighter leading-none">50+</p>
                <p className="text-white/40 text-[11px] mt-2 font-medium tracking-[0.2em] uppercase">Experts</p>
              </div>
              <div>
                <p className="font-display text-gold-400 text-4xl sm:text-5xl tracking-tighter leading-none">&lt;1 hr</p>
                <p className="text-white/40 text-[11px] mt-2 font-medium tracking-[0.2em] uppercase">Response</p>
              </div>
              <div>
                <p className="font-display text-white text-4xl sm:text-5xl tracking-tighter leading-none">24/7</p>
                <p className="text-white/40 text-[11px] mt-2 font-medium tracking-[0.2em] uppercase">Available</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
