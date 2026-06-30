"use client";

import { useState, useRef, useEffect } from "react";
import {
  CUSTOMER_FAQS,
  RETAILER_FAQS,
  HELPLINE,
  HELPLINE_WA,
  type Faq,
} from "@/lib/chat-knowledge";

type Branch = "customer" | "retailer";
type Msg = { role: "user" | "assistant"; content: string };

const NAVY = "#0A1628";
const GOLD = "#C39236";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "", city: "", shop_name: "", consent: false });
  const [leadState, setLeadState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [leadErr, setLeadErr] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, leadOpen, sending]);

  const faqs: Faq[] = branch === "retailer" ? RETAILER_FAQS : CUSTOMER_FAQS;

  const pickBranch = (b: Branch) => {
    setBranch(b);
    setMsgs([
      {
        role: "assistant",
        content:
          b === "retailer"
            ? "Great! I can tell you how partnering with Credit Speed works. Tap a question, ask me anything, or leave your details for a callback."
            : "Sure! I can explain how smartphone EMI works. Tap a question, ask me anything, or estimate your EMI.",
      },
    ]);
  };

  const askFaq = (f: Faq) => {
    setMsgs((m) => [...m, { role: "user", content: f.q }, { role: "assistant", content: f.a }]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setSending(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const j = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: j.reply || "Please try again." }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: `Network issue — please call/WhatsApp us at ${HELPLINE}.` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const submitLead = async () => {
    setLeadErr("");
    if (lead.phone.replace(/\D/g, "").length < 10) { setLeadErr("Please enter a valid 10-digit phone."); return; }
    if (!lead.consent) { setLeadErr("Please tick consent so our team can call you."); return; }
    setLeadState("saving");
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, lead_type: branch || "customer", intent: msgs.slice(-1)[0]?.content || "" }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) { setLeadErr(j.error || "Could not save. Try again."); setLeadState("error"); return; }
      setLeadState("done");
    } catch {
      setLeadErr("Network error. Try again."); setLeadState("error");
    }
  };

  const isRetailer = branch === "retailer";

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Credit Speed Assistant"
          style={{ background: NAVY }}
          className="fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform"
        >
          <span style={{ position: "absolute", inset: 0, borderRadius: 9999, boxShadow: `0 0 0 2px ${GOLD}55` }} />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[60] w-[92vw] max-w-[380px] h-[70vh] max-h-[560px] rounded-2xl bg-white shadow-2xl border border-black/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div style={{ background: NAVY }} className="px-4 py-3 flex items-center justify-between text-white">
            <div>
              <p className="text-[14px] font-semibold leading-tight">Credit Speed Assistant</p>
              <p className="text-[11px] text-white/60">EMI help & partner support</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/70 hover:text-white text-xl leading-none">×</button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#f7f8fa]">
            {!branch ? (
              <div className="space-y-3">
                <Bubble>Namaste! 🙏 I'm the Credit Speed Assistant. Are you a customer or a shop owner?</Bubble>
                <div className="flex gap-2">
                  <button onClick={() => pickBranch("customer")} className="flex-1 rounded-xl border border-black/10 bg-white py-2.5 text-[13px] font-medium hover:border-black/30" style={{ color: NAVY }}>🧑 I'm a Customer</button>
                  <button onClick={() => pickBranch("retailer")} className="flex-1 rounded-xl border border-black/10 bg-white py-2.5 text-[13px] font-medium hover:border-black/30" style={{ color: NAVY }}>🏪 I'm a Shop owner</button>
                </div>
              </div>
            ) : (
              <>
                {msgs.map((m, i) =>
                  m.role === "assistant" ? (
                    <Bubble key={i}>{m.content}</Bubble>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div style={{ background: NAVY }} className="max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 text-[13px] text-white">{m.content}</div>
                    </div>
                  )
                )}
                {sending && <Bubble>…</Bubble>}

                {leadOpen && leadState !== "done" && (
                  <div className="rounded-xl border border-black/10 bg-white p-3 space-y-2">
                    <p className="text-[12px] font-semibold" style={{ color: NAVY }}>
                      {isRetailer ? "Become a partner" : "Get a callback"}
                    </p>
                    <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Your name" className="w-full rounded-lg border border-black/15 px-3 py-2 text-[13px]" />
                    <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="Phone (10 digits)" inputMode="numeric" className="w-full rounded-lg border border-black/15 px-3 py-2 text-[13px]" />
                    <input value={lead.city} onChange={(e) => setLead({ ...lead, city: e.target.value })} placeholder="City" className="w-full rounded-lg border border-black/15 px-3 py-2 text-[13px]" />
                    {isRetailer && (
                      <input value={lead.shop_name} onChange={(e) => setLead({ ...lead, shop_name: e.target.value })} placeholder="Shop name" className="w-full rounded-lg border border-black/15 px-3 py-2 text-[13px]" />
                    )}
                    <label className="flex items-start gap-2 text-[11px] text-black/60">
                      <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} className="mt-0.5" />
                      I agree to be contacted by Credit Speed about this enquiry.
                    </label>
                    {leadErr && <p className="text-[11px] text-red-600">{leadErr}</p>}
                    <button onClick={submitLead} disabled={leadState === "saving"} style={{ background: GOLD }} className="w-full rounded-lg py-2 text-[13px] font-semibold text-white disabled:opacity-60">
                      {leadState === "saving" ? "Saving…" : "Submit"}
                    </button>
                  </div>
                )}
                {leadState === "done" && (
                  <Bubble>Thank you! ✅ Our team will call you shortly. You can also reach us on {HELPLINE}.</Bubble>
                )}
              </>
            )}
          </div>

          {/* Quick replies + CTAs + input */}
          {branch && (
            <div className="border-t border-black/10 bg-white">
              <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                {faqs.map((f) => (
                  <button key={f.q} onClick={() => askFaq(f)} className="whitespace-nowrap rounded-full border border-black/10 px-3 py-1 text-[11px] text-black/70 hover:border-black/30">
                    {f.q}
                  </button>
                ))}
              </div>
              <div className="px-3 py-2 flex flex-wrap gap-1.5 text-[11px]">
                {!isRetailer && (
                  <a href="/" style={{ color: NAVY }} className="rounded-full bg-black/5 px-3 py-1 font-medium">📱 Estimate EMI</a>
                )}
                <button onClick={() => setLeadOpen(true)} style={{ color: NAVY }} className="rounded-full bg-black/5 px-3 py-1 font-medium">
                  {isRetailer ? "🤝 Become a partner" : "📞 Get a callback"}
                </button>
                <a href={`https://wa.me/${HELPLINE_WA}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 font-medium">WhatsApp</a>
                <a href={`tel:+${HELPLINE_WA}`} style={{ color: NAVY }} className="rounded-full bg-black/5 px-3 py-1 font-medium">Call</a>
              </div>
              <div className="px-2 pb-2 flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type your question…"
                  className="flex-1 rounded-full border border-black/15 px-3 py-2 text-[13px] outline-none"
                />
                <button onClick={send} disabled={sending || !input.trim()} style={{ background: NAVY }} className="h-9 w-9 rounded-full text-white flex items-center justify-center disabled:opacity-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              <p className="px-3 pb-2 text-[9px] text-black/35 leading-tight">
                Estimates only; final approval by our RBI-licensed lending partner. Don't share Aadhaar/PAN/OTP in chat.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-black/10 px-3 py-2 text-[13px] text-black/80 whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}
