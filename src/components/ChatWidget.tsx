"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HELPLINE, HELPLINE_WA } from "@/lib/chat-knowledge";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How does the EMI work?",
  "What documents do I need?",
  "I want to partner my shop",
  "Talk to a person",
];

const GREETING =
  "Namaste! 🙏 I'm the Credit Speed assistant. I can help you get a smartphone on EMI, or partner your shop with us. What would you like to know?";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [retailer, setRetailer] = useState(false); // inferred lead_type
  const [leadOpen, setLeadOpen] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "", city: "", shop_name: "", consent: false });
  const [leadState, setLeadState] = useState<"idle" | "saving" | "done">("idle");
  const [leadErr, setLeadErr] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, sending, leadOpen, leadState]);

  const inferRetailer = (t: string) => /partner|shop|retail|dukan|store|merchant|दुकान/i.test(t);

  const sendText = async (text: string) => {
    const clean = text.trim();
    if (!clean || sending) return;
    if (inferRetailer(clean)) setRetailer(true);
    if (/talk to a person|callback|call me|agent|human/i.test(clean)) {
      setMsgs((m) => [...m, { role: "user", content: clean }, { role: "assistant", content: "Of course — leave your details and our team will call you. Or reach us directly on " + HELPLINE + "." }]);
      setLeadOpen(true);
      setInput("");
      return;
    }
    const next: Msg[] = [...msgs, { role: "user", content: clean }];
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
      setMsgs((m) => [...m, { role: "assistant", content: `Network issue — please call/WhatsApp us at ${HELPLINE}.` }]);
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
        body: JSON.stringify({ ...lead, lead_type: retailer ? "retailer" : "customer", intent: msgs.slice(-2).map((m) => m.content).join(" | ") }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) { setLeadErr(j.error || "Could not save. Try again."); setLeadState("idle"); return; }
      setLeadState("done");
      setLeadOpen(false);
      setMsgs((m) => [...m, { role: "assistant", content: "Thank you! ✅ Our team will call you shortly." }]);
    } catch {
      setLeadErr("Network error. Try again."); setLeadState("idle");
    }
  };

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            aria-label="Open Credit Speed Assistant"
            className="fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(150deg,#13233d,#0A1628)", boxShadow: "0 10px 30px rgba(0,0,0,.35), 0 0 0 1px rgba(212,168,83,.35), 0 0 24px rgba(212,168,83,.25)" }}
          >
            <span className="absolute inset-0 rounded-full animate-ping" style={{ boxShadow: "0 0 0 2px rgba(212,168,83,.35)", animationDuration: "2.4s" }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A853" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-5 right-5 z-[60] w-[92vw] max-w-[392px] h-[72vh] max-h-[600px] rounded-3xl flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(165deg,#0c1a30,#050b17 70%)", border: "1px solid rgba(212,168,83,.20)", boxShadow: "0 30px 70px rgba(0,0,0,.55), 0 0 40px rgba(212,168,83,.08)", backdropFilter: "blur(12px)" }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#D4A853,#C39236)" }}>
                <span className="text-[15px] font-bold" style={{ color: "#0A1628", fontFamily: "var(--font-sora,inherit)" }}>C</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-white leading-tight">Credit Speed Assistant</p>
                <p className="text-[11px] flex items-center gap-1.5" style={{ color: "#9fb0c9" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" /> Online · replies instantly
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/45 hover:text-white text-2xl leading-none px-1">×</button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2.5">
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className="max-w-[84%] px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap"
                    style={
                      m.role === "user"
                        ? { background: "linear-gradient(135deg,#D4A853,#C39236)", color: "#0A1628", borderRadius: "16px 16px 4px 16px", fontWeight: 500 }
                        : { background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.88)", borderRadius: "16px 16px 16px 4px" }
                    }
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                    <span className="flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: "#D4A853" }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}

              {/* Lead form */}
              {leadOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-3.5 space-y-2" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(212,168,83,.2)" }}>
                  <p className="text-[12px] font-semibold" style={{ color: "#D4A853" }}>{retailer ? "Partner your shop — request a callback" : "Request a callback"}</p>
                  {(["name", "phone", "city"] as const).map((k) => (
                    <input key={k} value={lead[k]} onChange={(e) => setLead({ ...lead, [k]: e.target.value })}
                      placeholder={k === "phone" ? "Phone (10 digits)" : k[0].toUpperCase() + k.slice(1)}
                      inputMode={k === "phone" ? "numeric" : "text"}
                      className="w-full rounded-lg px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35"
                      style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }} />
                  ))}
                  {retailer && (
                    <input value={lead.shop_name} onChange={(e) => setLead({ ...lead, shop_name: e.target.value })} placeholder="Shop name"
                      className="w-full rounded-lg px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/35" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }} />
                  )}
                  <label className="flex items-start gap-2 text-[11px] text-white/55">
                    <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} className="mt-0.5 accent-[#D4A853]" />
                    I agree to be contacted by Credit Speed about this enquiry.
                  </label>
                  {leadErr && <p className="text-[11px] text-red-400">{leadErr}</p>}
                  <button onClick={submitLead} disabled={leadState === "saving"} className="w-full rounded-lg py-2 text-[13px] font-semibold disabled:opacity-60" style={{ background: "linear-gradient(135deg,#D4A853,#C39236)", color: "#0A1628" }}>
                    {leadState === "saving" ? "Saving…" : "Submit"}
                  </button>
                </motion.div>
              )}

              {/* Starter chips — only at the very start */}
              {msgs.length === 1 && !leadOpen && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => sendText(s)} className="rounded-full px-3 py-1.5 text-[12px] transition-colors"
                      style={{ border: "1px solid rgba(212,168,83,.3)", color: "rgba(212,168,83,.95)" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer: quick actions + input */}
            <div className="border-t border-white/[0.06] px-3 pt-2 pb-2.5">
              <div className="flex gap-1.5 mb-2 text-[11px]">
                <a href="/" className="rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,.05)", color: "#cdd8e8" }}>📱 Estimate EMI</a>
                <a href={`https://wa.me/${HELPLINE_WA}`} target="_blank" rel="noopener noreferrer" className="rounded-full px-2.5 py-1" style={{ background: "rgba(16,185,129,.14)", color: "#5eead4" }}>WhatsApp</a>
                <a href={`tel:+${HELPLINE_WA}`} className="rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,.05)", color: "#cdd8e8" }}>Call</a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendText(input)}
                  placeholder="Type your message…"
                  className="flex-1 rounded-full px-4 py-2.5 text-[13.5px] text-white outline-none placeholder:text-white/35"
                  style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}
                />
                <button onClick={() => sendText(input)} disabled={sending || !input.trim()} aria-label="Send" className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-45" style={{ background: "linear-gradient(135deg,#D4A853,#C39236)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              <p className="pt-1.5 text-[9px] text-white/30 leading-tight text-center">
                Estimates only; final approval by our RBI-licensed lending partner. Never share Aadhaar/PAN/OTP here.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
