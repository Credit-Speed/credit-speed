"use client";

import { useMemo, useState } from "react";
import {
  PHONES, BRANDS, TENURES, DEFAULT_TENURE, DOWN_PAYMENT,
  monthlyInstalment, type Phone,
} from "@/data/phones";

const rs = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);

const BUDGETS = [
  { label: "Under ₹10,000", min: 0, max: 9999 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 14999 },
  { label: "₹15,000 – ₹25,000", min: 15000, max: 24999 },
  { label: "₹25,000+", min: 25000, max: Infinity },
];

/**
 * The EMI shop.
 *
 * Browse → work out the instalment → leave a number. The lead goes to the
 * same `leads` table the chat widget already writes to, so the sales team
 * sees it in HRMS without anything new being built.
 *
 * The instalment is shown as an indicative figure, not a rate. The merchant
 * confirms the final terms at the counter, and a number quoted here that the
 * counter then contradicts is worse than no number.
 */
export default function ShopClient() {
  const [brand, setBrand] = useState<string>("all");
  const [budget, setBudget] = useState<number>(-1);
  const [picked, setPicked] = useState<Phone | null>(null);
  const [tenure, setTenure] = useState<number>(DEFAULT_TENURE);
  const [down, setDown] = useState<number>(DOWN_PAYMENT.default);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const shown = useMemo(() => {
    const b = BUDGETS[budget];
    return PHONES.filter(
      (p) =>
        (brand === "all" || p.brand === brand) &&
        (!b || (p.price >= b.min && p.price <= b.max))
    ).sort((a, b2) => a.price - b2.price);
  }, [brand, budget]);

  const calc = picked ? monthlyInstalment(picked.price, down, tenure) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^\d{10}$/.test(phone.trim())) return setErr("Please enter a 10-digit mobile number.");
    if (!consent) return setErr("Please tick the box so we can save your details and call you.");
    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          city: "Kanpur",
          source: "shop",
          consent: true,
          intent: picked
            ? `${picked.brand} ${picked.model} · ${rs(picked.price)} · ${tenure} months · down ${rs(calc!.down)} · EMI approx ${rs(calc!.emi)}`
            : "EMI enquiry from shop",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not send. Please try again.");
      setDone(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSending(false);
    }
  };

  const chip = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm transition-colors border ${
      active
        ? "bg-gold-400 text-[#050B17] border-gold-400 font-semibold"
        : "border-white/12 text-white/65 hover:border-gold-400/40"
    }`;

  return (
    <>
      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setBrand("all")} className={chip(brand === "all")}>All brands</button>
        {BRANDS.map((b) => (
          <button key={b} onClick={() => setBrand(b)} className={chip(brand === b)}>{b}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-10">
        <button onClick={() => setBudget(-1)} className={chip(budget === -1)}>Any budget</button>
        {BUDGETS.map((b, i) => (
          <button key={b.label} onClick={() => setBudget(i)} className={chip(budget === i)}>{b.label}</button>
        ))}
      </div>

      {/* ── Catalogue ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((p) => {
          const { emi } = monthlyInstalment(p.price, DOWN_PAYMENT.default, DEFAULT_TENURE);
          const active = picked?.slug === p.slug;
          return (
            <button
              key={p.slug}
              onClick={() => { setPicked(p); setDone(false); setErr(null); }}
              className={`text-left p-5 rounded-2xl border transition-colors min-w-0 ${
                active ? "border-gold-400/60 bg-gold-400/[0.06]" : "border-white/10 hover:border-gold-400/35"
              }`}
            >
              <p className="text-white/40 text-[11px] uppercase tracking-widest">{p.brand}</p>
              <p className="text-white font-semibold text-[15px] mt-1">{p.model}</p>
              <p className="text-white/45 text-[13px] mt-1">{p.highlight}</p>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="font-display text-gold-400 text-xl tracking-tight">{rs(emi)}</span>
                <span className="text-white/40 text-xs">/ month</span>
              </div>
              <p className="text-white/35 text-xs mt-1">{rs(p.price)} · {DEFAULT_TENURE} months</p>
            </button>
          );
        })}
      </div>
      {!shown.length && (
        <p className="text-white/40 text-sm py-10 text-center">
          Nothing in that range. Try a wider budget.
        </p>
      )}

      {/* ── Calculator + enquiry ── */}
      {picked && calc && (
        <div id="enquire" className="mt-12 p-6 sm:p-8 rounded-2xl border border-gold-400/25 bg-white/[0.02]">
          <p className="text-white/40 text-[11px] uppercase tracking-widest">{picked.brand}</p>
          <h2 className="font-display text-white text-2xl sm:text-3xl tracking-tighter mt-1 mb-6">
            {picked.model}
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-white/45 text-xs uppercase tracking-widest mb-3">
                Down payment — {down}% ({rs(calc.down)})
              </label>
              <input
                type="range"
                min={DOWN_PAYMENT.min}
                max={DOWN_PAYMENT.max}
                step={5}
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className="w-full accent-[#C39236]"
              />

              <label className="block text-white/45 text-xs uppercase tracking-widest mt-6 mb-3">
                Repayment period
              </label>
              <div className="flex gap-2">
                {TENURES.map((t) => (
                  <button key={t} onClick={() => setTenure(t)} className={chip(tenure === t)}>
                    {t} months
                  </button>
                ))}
              </div>

              <div className="mt-7 p-5 rounded-xl bg-white/[0.04] border border-white/8">
                <p className="text-white/45 text-xs uppercase tracking-widest">Monthly instalment</p>
                <p className="font-display text-gold-400 text-4xl tracking-tighter mt-1">{rs(calc.emi)}</p>
                <p className="text-white/40 text-[13px] mt-2">
                  {rs(calc.down)} today, then {tenure} payments of {rs(calc.emi)}.
                </p>
                <p className="text-white/30 text-[11px] mt-3 leading-relaxed">
                  Indicative only. Your final instalment is confirmed at the shop once the
                  application is approved.
                </p>
              </div>
            </div>

            <div>
              {done ? (
                <div className="h-full flex flex-col justify-center">
                  <p className="font-display text-white text-2xl tracking-tighter mb-3">
                    Thanks — we&apos;ll call you.
                  </p>
                  <p className="text-white/55 text-sm leading-relaxed">
                    Our team will ring you about the {picked.model} and tell you the nearest
                    partner shop that has it. Bring your Aadhaar, PAN and bank details when
                    you go.
                  </p>
                  <a
                    href="/stores/kanpur"
                    className="mt-6 inline-block text-gold-400 text-sm font-semibold"
                  >
                    See all partner shops in Kanpur →
                  </a>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3">
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Leave your number and we will tell you which nearby shop has this phone,
                    and what you need to bring.
                  </p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold-400/50"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-gold-400/50"
                  />
                  <label className="flex gap-2.5 items-start text-white/45 text-xs leading-relaxed pt-1">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 accent-[#C39236]"
                    />
                    <span>
                      I agree that Credit Speed may save these details and contact me about this
                      enquiry.
                    </span>
                  </label>
                  {err && <p className="text-red-300/90 text-xs">{err}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Get a call back"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
