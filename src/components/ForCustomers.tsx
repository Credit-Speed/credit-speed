"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// EMI formula calibrated to TFL's live disbursement model (verified
// against an actual Delivery Order: Product 19,273 → DP 3,855 (20%),
// Proc 682 (3.54%), Loan 15,418, EMI 2,753 @ 6 months).
//
// Important: Insurance and Dealer-Borne Discount (DBD) are absorbed
// by the merchant out of their TFL disbursement — they DO NOT enter
// the customer's loan or EMI. Customer-facing flow is just:
//
//   LoanAmount     = ProductPrice − DownPayment
//   MonthlyEMI     = LoanAmount × (1 + 1.2% × tenure) / tenure
//   PayableAtStore = DownPayment + ProcessingFee
//   Total          = (EMI × tenure) + PayableAtStore
//
// Users can choose to put MORE than the minimum down payment to reduce
// their monthly EMI. Min is the company's required floor; max keeps
// at least a small loan amount on the books.
const MIN_DOWN_PAYMENT_RATE = 0.20;        // 20% — TFL's required minimum
const MAX_DOWN_PAYMENT_RATE = 0.9;         // 90% — leave at least 10% to finance
const PROCESSING_FEE_RATE   = 0.03 * 1.18; // 3% + 18% GST = 3.54% of product value
const FLAT_RATE_PER_MONTH   = 0.012;       // 1.2% flat per month

const TENURES = [6, 8, 10] as const;

function computeEMI(
  productValue: number,
  tenureMonths: number,
  downPayment: number
) {
  const processingFee = productValue * PROCESSING_FEE_RATE;
  const loanAmount    = Math.max(productValue - downPayment, 0);
  const monthlyEMI    = loanAmount > 0
    ? (loanAmount * (1 + FLAT_RATE_PER_MONTH * tenureMonths)) / tenureMonths
    : 0;
  const payableAtStore = downPayment + processingFee;
  const totalAmount   = monthlyEMI * tenureMonths + payableAtStore;
  return {
    monthlyEMI:     Math.round(monthlyEMI),
    payableAtStore: Math.round(payableAtStore),
    totalAmount:    Math.round(totalAmount),
    loanAmount:     Math.round(loanAmount),
  };
}

const features = [
  {
    title: "Minimal documentation",
    desc: "Just Aadhaar and PAN. That's all.",
    iconPath: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  },
  {
    title: "5-minute approval",
    desc: "Real-time credit decisions. No waiting.",
    iconPath: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Build Apna Score",
    desc: "On-time payments unlock higher limits.",
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "Upgrade anytime",
    desc: "Pre-approved limit for your next phone.",
    iconPath: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
  },
];

export default function ForCustomers() {
  const [price, setPrice] = useState(12000);
  const [tenureIdx, setTenureIdx] = useState(0); // default 6 months
  const [downPayment, setDownPayment] = useState(
    Math.round(12000 * MIN_DOWN_PAYMENT_RATE)
  );

  const tenure = TENURES[tenureIdx];

  // Bounds for the down payment slider/input — recalc when price changes
  const minDP = useMemo(() => Math.round(price * MIN_DOWN_PAYMENT_RATE), [price]);
  const maxDP = useMemo(() => Math.round(price * MAX_DOWN_PAYMENT_RATE), [price]);

  // If user changes the phone price and their previous down payment is now
  // out of range, clamp it. Keeps the calculator always valid.
  useEffect(() => {
    if (downPayment < minDP) setDownPayment(minDP);
    else if (downPayment > maxDP) setDownPayment(maxDP);
    // intentionally omitting downPayment from deps — only react to price bounds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDP, maxDP]);

  const { monthlyEMI, payableAtStore, totalAmount } = useMemo(
    () => computeEMI(price, tenure, downPayment),
    [price, tenure, downPayment]
  );

  return (
    <section id="customers" className="bg-[#050B17] py-24 lg:py-32 border-t border-white/5 relative overflow-hidden">
      {/* gold glow */}
      <div className="absolute -left-40 top-1/4 w-[600px] h-[600px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,168,83,0.2) 0%, transparent 60%)" }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6"
          >
            <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-4">
              For Customers
            </p>
            <h2 className="font-display text-white text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] mb-6">
              Your phone.<br />
              <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
                Easy EMIs.
              </span>
            </h2>
            <p className="text-white/50 mb-10 max-w-md">
              No credit card. No paperwork. Walk into a Credit Speed partner store and take your phone home today.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="w-9 h-9 bg-gold-400/10 border border-gold-400/15 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.iconPath} />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                  <p className="text-white/45 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-6 glass-strong rounded-3xl p-7 lg:p-9 relative"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-white text-2xl tracking-tight">
                EMI Calculator
              </h3>
              <span className="text-gold-400/70 text-[10px] font-medium tracking-widest uppercase">
                Live
              </span>
            </div>
            <p className="text-white/40 text-xs mb-7">
              See how affordable your next phone can be
            </p>

            {/* Price — editable number + slider */}
            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor="emi-phone-price"
                  className="text-white/50 text-xs font-medium tracking-wider uppercase"
                >
                  Phone Price
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-display text-2xl tracking-tight">
                    &#8377;
                  </span>
                  <input
                    id="emi-phone-price"
                    type="number"
                    inputMode="numeric"
                    min={5000}
                    max={35000}
                    step={1}
                    value={price}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // allow empty string while typing
                      if (raw === "") {
                        setPrice(0);
                        return;
                      }
                      const val = Number(raw);
                      if (!Number.isNaN(val)) setPrice(val);
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (Number.isNaN(val) || val < 5000) setPrice(5000);
                      else if (val > 35000) setPrice(35000);
                    }}
                    aria-label="Phone price in rupees"
                    className="font-display text-2xl tracking-tight tabular-nums bg-transparent text-white w-28 text-right focus:outline-none border-b border-transparent focus:border-gold-400/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min={5000}
                max={35000}
                step={100}
                value={Math.min(Math.max(price, 5000), 35000)}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-400"
              />
              <div className="flex justify-between text-white/30 text-[10px] mt-2 tracking-wider">
                <span>&#8377;5K</span>
                <span className="text-white/40 italic">tap the number to type any amount</span>
                <span>&#8377;35K</span>
              </div>
            </div>

            {/* Down Payment — editable number + slider */}
            <div className="mb-7">
              <div className="flex justify-between items-center mb-3">
                <label
                  htmlFor="emi-down-payment"
                  className="text-white/50 text-xs font-medium tracking-wider uppercase"
                >
                  Down Payment
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-display text-2xl tracking-tight">
                    &#8377;
                  </span>
                  <input
                    id="emi-down-payment"
                    type="number"
                    inputMode="numeric"
                    min={minDP}
                    max={maxDP}
                    step={1}
                    value={downPayment}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setDownPayment(0);
                        return;
                      }
                      const val = Number(raw);
                      if (!Number.isNaN(val)) setDownPayment(val);
                    }}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (Number.isNaN(val) || val < minDP) setDownPayment(minDP);
                      else if (val > maxDP) setDownPayment(maxDP);
                    }}
                    aria-label="Down payment in rupees"
                    className="font-display text-2xl tracking-tight tabular-nums bg-transparent text-white w-28 text-right focus:outline-none border-b border-transparent focus:border-gold-400/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min={minDP}
                max={maxDP}
                step={100}
                value={Math.min(Math.max(downPayment, minDP), maxDP)}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-400"
              />
              <div className="flex justify-between text-white/30 text-[10px] mt-2 tracking-wider">
                <span>Min &#8377;{minDP.toLocaleString("en-IN")}</span>
                <span className="text-white/40 italic">pay more upfront, lower your EMI</span>
                <span>Max &#8377;{maxDP.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Tenure */}
            <div className="mb-7">
              <p className="text-white/50 text-xs font-medium tracking-wider uppercase mb-3">
                Choose Tenure
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TENURES.map((months, i) => (
                  <button
                    key={months}
                    onClick={() => setTenureIdx(i)}
                    className={`py-3 rounded-xl text-center transition-all ${
                      tenureIdx === i
                        ? "bg-gold-400 text-navy-500 shadow-lg shadow-gold-400/20"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <span className="block text-lg font-bold tabular-nums">{months}</span>
                    <span className="block text-[10px] tracking-wider">months</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/50 text-xs tracking-wider uppercase">Monthly EMI</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={monthlyEMI}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="font-display text-3xl text-gold-400 tabular-nums tracking-tight"
                  >
                    &#8377;{monthlyEMI.toLocaleString("en-IN")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/40">
                  <span>Phone Price</span>
                  <span className="tabular-nums">&#8377;{price.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-white/40">
                  <span>Payable at Store</span>
                  <span className="tabular-nums">&#8377;{payableAtStore.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-white font-semibold">
                  <span>Total Amount</span>
                  <span className="tabular-nums">&#8377;{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <a
              href="/stores"
              className="block w-full bg-white hover:bg-gold-200 text-navy-500 py-3 rounded-full font-semibold text-sm text-center mt-6 transition"
            >
              Find a store near you →
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
