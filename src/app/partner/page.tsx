"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Where partnership applications get delivered.
const APPLICATIONS_INBOX = "admin@creditspeed.in";

// Mailto fallback (used if the FormSubmit API call fails for any reason).
function mailtoFallback(form: {
  name: string; phone: string; email: string;
  shop: string; city: string; gst: string;
  volume: string; message: string;
}) {
  const body = `New retailer partnership application

Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email || "—"}
Shop: ${form.shop}
City: ${form.city}
GST Number: ${form.gst || "—"}
Monthly Smartphone Sales: ${form.volume || "—"}

Message:
${form.message || "—"}

— Submitted via creditspeed.in/partner`;

  const subject = `Retailer partnership application: ${form.shop}`;
  return `mailto:${APPLICATIONS_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const benefits = [
  { title: "High income potential", description: "Competitive commission on every EMI processed." },
  { title: "Easy onboarding", description: "GST + bank + Aadhaar + PAN. Activated in hours." },
  { title: "Recovery support", description: "We handle defaults and collections. You sell." },
  { title: "Sales team support", description: "Up to 50% of your sales executive's salary (T&C apply)." },
  { title: "Marketing kit", description: "Branded posters, standees, digital assets." },
  { title: "Live dashboard", description: "Loans, earnings, performance — one panel." },
];

const steps = [
  { num: "01", title: "Fill application", description: "Submit shop and contact details." },
  { num: "02", title: "Submit documents", description: "GST, bank statement, PAN, Aadhaar." },
  { num: "03", title: "Start earning", description: "Get Merchant ID. Same-day go-live." },
];

export default function PartnerPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    shop: "",
    city: "Lucknow",
    gst: "",
    volume: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // FormSubmit AJAX endpoint — sends the form payload to APPLICATIONS_INBOX
      // as a formatted email. First-ever submission triggers a one-time
      // confirmation email to the inbox owner; click the verify link once
      // and all future submissions flow through automatically.
      const res = await fetch(
        `https://formsubmit.co/ajax/${APPLICATIONS_INBOX}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...form,
            _subject: `Retailer partnership application: ${form.shop || form.name}`,
            _template: "table",
            _captcha: "false",
          }),
        }
      );
      const data = await res.json();

      const ok =
        data.success === true ||
        data.success === "true" ||
        res.ok;

      if (!ok) throw new Error(data.message || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      // Fallback — open user's mail client with all the data pre-filled
      const url = mailtoFallback(form);
      window.location.href = url;
      setError(
        "Couldn't send automatically — your email client is opening with the message pre-filled. Please send it from there."
      );
    } finally {
      setSubmitting(false);
    }
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
            For Retailers
          </p>
          <h1 className="relative font-display text-white text-5xl sm:text-7xl lg:text-8xl tracking-tighter leading-[0.95] max-w-5xl mx-auto mb-7">
            Grow your<br />
            <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">business.</span>
          </h1>
          <p className="relative text-white/55 max-w-xl mx-auto mb-10 text-sm">
            Join 500+ mobile retailers across UP earning more with EMI financing.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#apply" className="bg-white hover:bg-gold-200 text-navy-500 px-8 py-3 rounded-full font-semibold text-sm transition">
              Apply Now
            </a>
            <a
              href="https://signup.oroboro.in/AgentOnboard/KycRegistration?params=OSgZ0NA5ls0=&LoanType=AgentOnboard"
              target="_blank"
              rel="noopener noreferrer"
              className="glass text-white hover:border-gold-400/30 px-8 py-3 rounded-full font-semibold text-sm transition"
            >
              Direct Onboarding →
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
                Why Partner
              </p>
              <h2 className="font-display text-white text-5xl sm:text-6xl tracking-tighter leading-[0.95]">
                Everything you need.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <div key={b.title} className="glass rounded-2xl p-7 hover:border-gold-400/25 transition-colors">
                  <div className="w-10 h-10 bg-gold-400/10 border border-gold-400/15 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-white text-lg tracking-tight mb-2">{b.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
                Get Started
              </p>
              <h2 className="font-display text-white text-5xl sm:text-6xl tracking-tighter leading-[0.95]">
                Three steps.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {steps.map((s) => (
                <div key={s.num} className="glass rounded-3xl p-9">
                  <p className="font-display text-gold-400/30 text-6xl tracking-tighter leading-none">{s.num}</p>
                  <h3 className="font-display text-white text-xl tracking-tight mt-5 mb-2">{s.title}</h3>
                  <p className="text-white/45 text-sm">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application form */}
        <section id="apply" className="py-20 px-6 lg:px-12 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
                Application
              </p>
              <h2 className="font-display text-white text-5xl sm:text-6xl tracking-tighter leading-[0.95] mb-3">
                Apply now.
              </h2>
              <p className="text-white/45 text-sm">We&apos;ll contact you within 24 hours.</p>
            </div>

            {submitted ? (
              <div className="glass-strong rounded-3xl p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-white text-3xl tracking-tight mb-3">
                  Application received.
                </h3>
                <p className="text-white/65 text-[15px] max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{form.name || "partner"}</span>. Our onboarding team will reach out within <span className="text-gold-400">24 hours</span> at <span className="text-white">{form.phone}</span>{form.email && <> or <span className="text-white">{form.email}</span></>}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError(null);
                    setForm({
                      name: "", phone: "", email: "", shop: "",
                      city: "Lucknow", gst: "", volume: "", message: "",
                    });
                  }}
                  className="mt-7 inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 text-sm font-semibold transition"
                >
                  Submit another application →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-7 sm:p-10">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input required name="name" value={form.name} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input required type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Shop Name *</label>
                    <input required name="shop" value={form.shop} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City *</label>
                    <select required name="city" value={form.city} onChange={handleChange} className={inputClass}>
                      <option className="bg-navy-500">Lucknow</option>
                      <option className="bg-navy-500">Kanpur</option>
                      <option className="bg-navy-500">Varanasi</option>
                      <option className="bg-navy-500">Agra</option>
                      <option className="bg-navy-500">Meerut</option>
                      <option className="bg-navy-500">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>GST Number</label>
                    <input name="gst" value={form.gst} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Monthly Smartphone Sales</label>
                    <select name="volume" value={form.volume} onChange={handleChange} className={inputClass}>
                      <option value="" className="bg-navy-500">Select range</option>
                      <option className="bg-navy-500">Less than 10 phones</option>
                      <option className="bg-navy-500">10–50 phones</option>
                      <option className="bg-navy-500">50–100 phones</option>
                      <option className="bg-navy-500">100+ phones</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
                  </div>
                </div>

                {error && (
                  <p className="mt-5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-7 bg-white hover:bg-gold-200 text-navy-500 py-3.5 rounded-full font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending application...
                    </>
                  ) : (
                    "Apply for Partnership"
                  )}
                </button>

                <p className="text-white/35 text-xs text-center mt-5">
                  Goes straight to <span className="text-white/55">{APPLICATIONS_INBOX}</span>. By applying, you agree to our{" "}
                  <Link href="/terms" className="text-gold-400 underline">Terms</Link> and{" "}
                  <Link href="/privacy" className="text-gold-400 underline">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
