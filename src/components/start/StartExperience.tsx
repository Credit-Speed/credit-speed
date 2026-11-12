"use client";

/**
 * The /start page: a 3D phone that turns as you scroll through four steps,
 * two buttons that never leave the bottom edge, and a short form behind each.
 *
 * Everything a visitor needs works without the 3D: the words, the buttons and
 * the form are plain HTML. The phone is loaded afterwards, and a flat drawn
 * phone takes its place on handsets that cannot run it.
 *
 * What the form asks: a name, a city, a mobile number, and consent to be
 * called. It never asks for Aadhaar, PAN, GSTIN or bank details.
 * A shop owner who has no GST registration is told to get one first, and
 * nothing about them is sent or stored.
 */
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { BUYING_OPTIONS, cleanCampaign, normaliseIndianMobile, type Buying, type LeadField } from "@/lib/lead-intake";
import type { PhoneScene, SceneMode } from "./phone-scene";
import s from "./start.module.css";

type Props = {
  fonts: { display: string; body: string };
  helpline: string;
  helplineWa: string;
};

type Step = "c-need" | "c-info" | "c-form" | "s-gst" | "s-nogst" | "s-form" | "done";
type Who = "customer" | "shop";
type Gl = "pending" | "on" | "off";

const CHAPTERS: { tag: string | null; title: ReactNode; en: string; lede: string; ledeEn: string }[] = [
  {
    tag: null,
    title: <>नया फ़ोन, <em>आसान EMI</em> पर</>,
    en: "A new phone on easy EMI",
    lede: "बिना क्रेडिट कार्ड। आधार, पैन और बैंक अकाउंट से, पास की दुकान पर।",
    ledeEn: "No credit card. Just Aadhaar, PAN and a bank account, at a shop near you.",
  },
  {
    tag: "पहला कदम",
    title: <>अपना <em>फ़ोन चुनें</em></>,
    en: "Pick your phone",
    lede: "पार्टनर दुकान पर जाइए और जो फ़ोन पसंद हो, वही चुनिए।",
    ledeEn: "Visit a partner shop and pick the phone you like.",
  },
  {
    tag: "दूसरा कदम",
    title: <><em>आधार, पैन</em> और बैंक डिटेल दिखाएँ</>,
    en: "Show your Aadhaar, PAN and bank details",
    lede: "ज़्यादातर मामलों में फ़ैसला कुछ ही मिनट में, वहीं काउंटर पर।",
    ledeEn: "In most cases the decision takes a few minutes, right at the counter.",
  },
  {
    tag: "तीसरा कदम",
    title: <>डाउन पेमेंट दें, बाक़ी <em>किस्तों में</em></>,
    en: "Pay a down payment, the rest in instalments",
    lede: "6, 8 या 10 महीने में चुकाएँ। डाउन पेमेंट की सही रकम दुकान पर बताई जाती है।",
    ledeEn: "Repay over 6, 8 or 10 months. The exact down payment is told to you at the shop.",
  },
  {
    tag: "बस इतना ही",
    title: <>फ़ोन लेकर <em>घर जाएँ</em></>,
    en: "Walk out with your phone",
    lede: "नीचे बताइए आप कौन हैं, हमारी टीम आपको कॉल करेगी।",
    ledeEn: "Tell us who you are below and our team will call you.",
  },
];

const FIELD_ERRORS: Record<Exclude<LeadField, "who" | "has_gst">, { hi: string; en: string }> = {
  shop_name: { hi: "दुकान का नाम लिखें", en: "Enter your shop's name" },
  name: { hi: "अपना नाम लिखें", en: "Enter your name" },
  city: { hi: "अपना शहर लिखें", en: "Enter your city" },
  phone: { hi: "10 अंकों का सही मोबाइल नंबर लिखें", en: "Enter a valid 10-digit mobile number" },
  consent: { hi: "कॉल के लिए आपकी सहमति ज़रूरी है", en: "Please tick the box so we may call you" },
};
type FormField = keyof typeof FIELD_ERRORS;
const FIELD_ORDER: FormField[] = ["shop_name", "name", "city", "phone", "consent"];

const CITY_CHIPS = [
  // Every partner shop is in Kanpur today. Add a city here when it has shops.
  { hi: "कानपुर", value: "Kanpur" },
];

const EMPTY = { shop_name: "", name: "", city: "", phone: "", consent: false, buying: null as Buying | null, hp_extra: "" };

/** Saved only when the Privacy Policy link is tapped, so an in-app browser that opens it in the same view does not lose the form. */
const DRAFT_KEY = "cs-start-draft";
const SHEET_MARK = "csSheet";
/** A second tap this soon after a dock button is the same tap, not an answer. */
const TAP_GUARD_MS = 400;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lettersIn = (v: string) => v.replace(/[\s\d.,'-]/g, "").length;

/** A short tick on Android. Does nothing where the browser has no vibration. */
function buzz(pattern: number | number[]) {
  try {
    // Only after a real tap; before one, the browser refuses and logs an error.
    const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } };
    if (nav.userActivation && !nav.userActivation.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* not available — fine */
  }
}

export default function StartExperience({ fonts, helpline, helplineWa }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const copies = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sceneRef = useRef<PhoneScene | null>(null);
  const chapterRef = useRef(0);
  const modeRef = useRef<SceneMode>("story");
  const freeRef = useRef(1);
  const campaignRef = useRef<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const busyRef = useRef(false);
  const openedAt = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const [live, setLive] = useState(false);
  const [gl, setGl] = useState<Gl>("pending");
  const [active, setActive] = useState(0);
  const [step, setStep] = useState<Step | null>(null);
  const [who, setWho] = useState<Who>("customer");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FormField, true>>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<null | "rate" | "down">(null);
  const [sent, setSent] = useState(false);
  const [closing, setClosing] = useState(false);
  // Browsers without <dialog> (iOS before 15.4) get WhatsApp links instead of the form.
  const [canDialog, setCanDialog] = useState(true);
  const uid = useId();

  // ── The page under this one is cream with a grain overlay. Not here. ──
  useEffect(() => {
    const { body } = document;
    const hadGrain = body.classList.contains("grain");
    const previous = body.style.background;
    body.classList.remove("grain");
    body.style.background = "#050B17";

    // The html element is shared with the rest of the site; set what this
    // page needs and put it all back on the way out.
    const html = document.documentElement;
    const before = {
      snap: html.style.scrollSnapType,
      gutter: html.style.getPropertyValue("scrollbar-gutter"),
      track: html.style.getPropertyValue("--scrollbar-track"),
      thumb: html.style.getPropertyValue("--scrollbar-thumb"),
    };
    // Scrolling comes to rest on a chapter, never on the empty space between two.
    html.style.scrollSnapType = "y proximity";
    // The site's scrollbar is cream in its light theme; dark here. And keep its
    // room reserved, so locking the scroll for the form does not shift the page.
    html.style.setProperty("scrollbar-gutter", "stable");
    html.style.setProperty("--scrollbar-track", "#050B17");
    html.style.setProperty("--scrollbar-thumb", "#1A2F5B");

    setCanDialog(typeof HTMLDialogElement === "function" && "showModal" in HTMLDialogElement.prototype);
    setLive(true);
    campaignRef.current = cleanCampaign(new URLSearchParams(window.location.search).get("src"));
    return () => {
      if (hadGrain) body.classList.add("grain");
      body.style.background = previous;
      html.style.scrollSnapType = before.snap;
      html.style.setProperty("scrollbar-gutter", before.gutter);
      html.style.setProperty("--scrollbar-track", before.track);
      html.style.setProperty("--scrollbar-thumb", before.thumb);
    };
  }, []);

  // ── The words keep clear of the dock, however tall it grows. ──
  useEffect(() => {
    const dock = dockRef.current;
    const root = rootRef.current;
    if (!dock || !root || typeof ResizeObserver !== "function") return;
    const sync = () => root.style.setProperty("--dock-h", `${dock.offsetHeight}px`);
    const observer = new ResizeObserver(sync);
    observer.observe(dock);
    sync();
    return () => observer.disconnect();
  }, [canDialog]);

  // ── Scroll: which chapter, how far, and which words are showing. ──
  useEffect(() => {
    const scroller = document.scrollingElement || document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const secs = sections.current.filter((x): x is HTMLElement => !!x);
      const n = secs.length;
      if (n < 2) return;
      const y = scroller.scrollTop;
      const tops = secs.map((sec) => sec.getBoundingClientRect().top + y);
      let f = n - 1;
      for (let i = 0; i < n - 1; i++) {
        if (y < tops[i + 1]) {
          f = i + clamp((y - tops[i]) / (tops[i + 1] - tops[i]), 0, 1);
          break;
        }
      }
      chapterRef.current = f;

      // Each chapter's words fade as they leave their resting place, so
      // mid-scroll the phone turns with nothing sliding across it.
      const wide = window.innerWidth >= 860 && window.innerWidth > window.innerHeight;
      const span = window.innerHeight * (wide ? 0.55 : 0.34);
      for (let i = 0; i < n; i++) {
        const copy = copies.current[i];
        if (!copy) continue;
        const d = Math.abs(y - tops[i]) / span;
        copy.style.opacity = d >= 1 ? "0" : String(1 - d * d);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${(f / (n - 1)).toFixed(4)})`;
      const whole = Math.round(f);
      setActive((prev) => (prev === whole ? prev : whole));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── The 3D phone: fetched after the page is usable, skipped where it would hurt. ──
  const fontDisplay = fonts.display;
  const fontBody = fonts.body;
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = storyRef.current;
    if (!canvas || !surface) return;

    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData || (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 1)) {
      setGl("off");
      return;
    }

    let cancelled = false;
    let scene: PhoneScene | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = () => {
      import("./phone-scene")
        .then(({ createPhoneScene }) => {
          if (cancelled) return;
          scene = createPhoneScene({
            canvas,
            fonts: { display: fontDisplay, body: fontBody },
            reducedMotion,
            chapter: () => chapterRef.current,
            dragSurface: surface,
            onContextLost: () => {
              scene?.dispose();
              scene = null;
              sceneRef.current = null;
              setGl("off");
            },
          });
          sceneRef.current = scene;
          scene.setMode(modeRef.current, freeRef.current);
          setGl("on");
        })
        .catch(() => {
          if (!cancelled) setGl("off");
        });
    };

    // Safari has no requestIdleCallback; a short wait does the same job there.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 250);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [fontDisplay, fontBody]);

  // ── The phone makes room for the form, and celebrates when it is sent. ──
  useEffect(() => {
    modeRef.current = step === null ? "story" : step === "done" ? "done" : "sheet";
    const d = dialogRef.current;
    // How much of the screen the sheet leaves free above it. Read from the
    // sheet's laid-out height, not its on-screen box, which is mid-slide.
    const measure = () => {
      const open = !!d && d.open && step !== null;
      freeRef.current = open ? clamp(1 - d.offsetHeight / window.innerHeight, 0, 1) : 1;
      sceneRef.current?.setMode(modeRef.current, freeRef.current);
    };
    measure();
    if (!d || step === null) return;
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(d);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [step]);

  // ── The sheet: a native <dialog>, so focus stays inside it and Esc closes it. ──
  const openSheet = useCallback((first: Step, as: Who) => {
    const d = dialogRef.current;
    if (!d || typeof d.showModal !== "function") return;
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setClosing(false);
    setWho(as);
    setErrors({});
    setFailure(null);
    setStep(first);
    if (!d.open) {
      d.showModal();
      openedAt.current = performance.now();
      // A history entry for the sheet, so the phone's Back button closes it
      // instead of leaving the page. In-app browsers (Instagram, WhatsApp)
      // never tell the page about Back any other way. Next.js keeps its own
      // data in history.state, so that is carried over, and no URL is set.
      if (!history.state?.[SHEET_MARK]) {
        try {
          history.pushState({ ...history.state, [SHEET_MARK]: true }, "");
        } catch {
          /* history unavailable — the close button still works */
        }
      }
    }
    buzz(8);
  }, []);

  const closeSheet = useCallback(() => {
    const d = dialogRef.current;
    // Never while a lead is being sent, and never twice.
    if (!d || !d.open || busyRef.current || closeTimer.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      d.close();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setClosing(false);
      if (busyRef.current) return;
      d.close();
    }, 220);
  }, []);

  // Back pressed while the sheet is open: close it, or, mid-send, stay put.
  useEffect(() => {
    const onPop = () => {
      const d = dialogRef.current;
      if (!d?.open) return;
      if (busyRef.current) {
        try {
          history.pushState({ ...history.state, [SHEET_MARK]: true }, "");
        } catch {
          /* ignore */
        }
        return;
      }
      closeSheet();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeSheet]);

  // Back from the Privacy Policy in an in-app browser: put the form back as it was.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(DRAFT_KEY);
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { form?: Partial<typeof EMPTY>; step?: Step; who?: Who };
      if ((draft.step === "c-form" || draft.step === "s-form") && (draft.who === "customer" || draft.who === "shop")) {
        setForm({ ...EMPTY, ...draft.form, hp_extra: "" });
        openSheet(draft.step, draft.who);
      }
    } catch {
      /* a broken draft is simply dropped */
    }
  }, [openSheet]);

  const saveDraft = () => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form: { ...form, hp_extra: "" }, step, who }));
    } catch {
      /* storage blocked — the link still works */
    }
  };

  useEffect(
    () => () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  // Stop the page behind from scrolling while the sheet is open.
  useEffect(() => {
    if (step === null) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [step === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Announce each new step: move focus to its heading (not to an input, which
  // would throw the keyboard up over the question before it has been read).
  useEffect(() => {
    if (step) headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (next: Step) => {
    setErrors({});
    setFailure(null);
    setStep(next);
    buzz(8);
  };

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in FIELD_ERRORS) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /**
   * Digits only. A pasted "+91 98765 43210" or "098765 43210" loses its
   * prefix; anything else is kept as typed, so a stray extra digit shows up
   * as an error instead of silently becoming a different number.
   */
  const setPhone = (raw: string) => {
    let d = raw.replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    set("phone", d.slice(0, 12));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const found: Partial<Record<FormField, true>> = {};
    if (who === "shop" && lettersIn(form.shop_name) < 2) found.shop_name = true;
    if (lettersIn(form.name) < 2) found.name = true;
    if (lettersIn(form.city) < 2) found.city = true;
    if (!normaliseIndianMobile(form.phone)) found.phone = true;
    if (!form.consent) found.consent = true;
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      buzz([18, 50, 18]);
      return;
    }

    setBusy(true);
    busyRef.current = true;
    setFailure(null);
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch("/api/landing-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who,
          has_gst: who === "shop" ? true : undefined,
          shop_name: who === "shop" ? form.shop_name : undefined,
          name: form.name,
          city: form.city,
          phone: form.phone,
          buying: who === "customer" ? (form.buying ?? undefined) : undefined,
          consent: true,
          src: campaignRef.current ?? undefined,
          hp_extra: form.hp_extra,
        }),
        signal: ctrl.signal,
      });
      const json: { ok?: boolean; field?: string } | null = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setSent(true);
        setForm(EMPTY);
        setStep("done");
        buzz([14, 70, 28]);
        return;
      }
      if (res.status === 400 && json?.field && json.field in FIELD_ERRORS) {
        setErrors({ [json.field as FormField]: true });
        document.getElementById(`${uid}-${json.field}`)?.focus();
        return;
      }
      setFailure(res.status === 429 ? "rate" : "down");
    } catch {
      setFailure("down");
    } finally {
      window.clearTimeout(timer);
      busyRef.current = false;
      setBusy(false);
      // If the sheet was somehow closed mid-send, open it again so the
      // answer — thank you, or what went wrong — is actually seen.
      const d = dialogRef.current;
      if (d && !d.open) {
        try {
          d.showModal();
        } catch {
          /* ignore */
        }
      }
    }
  };

  const waText =
    who === "shop"
      ? "नमस्ते, मुझे अपनी दुकान Credit Speed से जोड़नी है।"
      : "नमस्ते, मुझे EMI पर फ़ोन के बारे में जानकारी चाहिए।";
  const waHref = `https://wa.me/${helplineWa}?text=${encodeURIComponent(waText)}`;

  const fieldError = (f: FormField) =>
    errors[f] ? (
      <p className={s.error} id={`${uid}-${f}-err`} role="alert">
        {FIELD_ERRORS[f].hi} <span lang="en">· {FIELD_ERRORS[f].en}</span>
      </p>
    ) : null;

  const textField = (f: "shop_name" | "name" | "city", hi: string, en: string, autoComplete: string) => (
    <div className={s.field}>
      <label htmlFor={`${uid}-${f}`}>
        {hi} <span lang="en">{en}</span>
      </label>
      <input
        id={`${uid}-${f}`}
        className={s.input}
        type="text"
        value={form[f]}
        onChange={(e) => set(f, e.target.value)}
        maxLength={f === "city" ? 80 : 120}
        autoComplete={autoComplete}
        autoCapitalize="words"
        enterKeyHint="next"
        aria-invalid={errors[f] ? true : undefined}
        aria-describedby={errors[f] ? `${uid}-${f}-err` : undefined}
      />
      {f === "city" && (
        <div className={s.chips}>
          {CITY_CHIPS.map((c) => (
            <button
              key={c.value}
              type="button"
              className={s.chip}
              aria-pressed={form.city === c.value}
              onClick={() => {
                set("city", c.value);
                buzz(6);
              }}
            >
              {c.hi}
            </button>
          ))}
        </div>
      )}
      {fieldError(f)}
    </div>
  );

  const leadForm = (
    <form className={s.form} onSubmit={submit} noValidate>
      {who === "customer" && (
        <fieldset className={s.field}>
          <legend>
            फ़ोन कब लेना है? <span lang="en">When do you plan to buy?</span>
          </legend>
          <div className={s.chips}>
            {BUYING_OPTIONS.map((b) => (
              <button
                key={b.value}
                type="button"
                className={s.chip}
                aria-pressed={form.buying === b.value}
                onClick={() => {
                  set("buying", form.buying === b.value ? null : b.value);
                  buzz(6);
                }}
              >
                {b.hi} <span lang="en">{b.en}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {who === "shop" && textField("shop_name", "दुकान का नाम", "Shop name", "organization")}
      {textField("name", "आपका नाम", "Your name", "name")}
      {textField("city", "शहर", "City", "address-level2")}

      <div className={s.field}>
        <label htmlFor={`${uid}-phone`}>
          मोबाइल नंबर <span lang="en">Mobile number</span>
        </label>
        <div className={s.phoneRow} data-invalid={errors.phone ? "" : undefined}>
          <span aria-hidden="true">+91</span>
          <input
            id={`${uid}-phone`}
            className={s.input}
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel-national"
            enterKeyHint="done"
            placeholder="98765 43210"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
          />
        </div>
        {fieldError("phone")}
      </div>

      {/* Not for people. A script that fills every field fills this one too.
          Named so that no browser or password manager autofills it. */}
      <div className={s.trap} aria-hidden="true">
        <input
          id={`${uid}-hp`}
          type="text"
          name="hp_extra"
          tabIndex={-1}
          autoComplete="off"
          data-1p-ignore=""
          data-lpignore="true"
          data-bwignore=""
          data-form-type="other"
          value={form.hp_extra}
          onChange={(e) => set("hp_extra", e.target.value)}
        />
      </div>

      <div className={s.field}>
        <label className={s.consent} htmlFor={`${uid}-consent`}>
          <input
            id={`${uid}-consent`}
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
          />
          <span>
            मैं सहमत हूँ कि Credit Speed मेरी इस पूछताछ के बारे में मुझे इस नंबर पर कॉल या WhatsApp कर सकता है।{" "}
            <span lang="en">
              I agree that Credit Speed may call or WhatsApp me on this number about this enquiry.
            </span>{" "}
            <a href="/privacy" target="_blank" rel="noopener" onClick={saveDraft}>
              Privacy Policy
            </a>
          </span>
        </label>
        {fieldError("consent")}
      </div>

      {failure && (
        <div className={s.failure} role="alert">
          <p>
            {failure === "rate"
              ? "बहुत बार कोशिश हो चुकी है। थोड़ी देर बाद दोबारा कोशिश करें, या हमें WhatsApp करें।"
              : "अभी आपकी जानकारी सेव नहीं हो पाई। दोबारा कोशिश करें, या हमें सीधे WhatsApp करें।"}
          </p>
          <p lang="en">
            {failure === "rate"
              ? "Too many attempts. Please try again in a little while, or WhatsApp us."
              : "We could not save your details just now. Please try again, or WhatsApp us directly."}
          </p>
          <a className={s.waLink} href={waHref} target="_blank" rel="noopener noreferrer">
            WhatsApp {helpline}
          </a>
        </div>
      )}

      <button className={s.submit} type="submit" disabled={busy} data-busy={busy ? "" : undefined}>
        {busy ? (
          <>
            भेज रहे हैं… <small lang="en">Sending</small>
          </>
        ) : who === "shop" ? (
          <>
            मुझे कॉल करें <small lang="en">Call me about partnering</small>
          </>
        ) : (
          <>
            मुझे कॉल करें <small lang="en">Call me</small>
          </>
        )}
      </button>
      <p className={s.assure}>
        हम यहाँ आधार, पैन या बैंक की कोई जानकारी नहीं माँगते।{" "}
        <span lang="en">We never ask for Aadhaar, PAN or bank details here.</span>
      </p>
    </form>
  );

  const heading = (hi: ReactNode, en: string) => (
    <>
      <h2 className={s.sheetTitle} id={`${uid}-title`} ref={headingRef} tabIndex={-1}>
        {hi}
      </h2>
      <p className={s.sheetEn} lang="en">
        {en}
      </p>
    </>
  );

  const choice = (hi: string, en: string, onClick: () => void, primary = false) => (
    <button type="button" className={s.choice} data-primary={primary ? "" : undefined} onClick={onClick}>
      <span>
        {hi}
        <small lang="en">{en}</small>
      </span>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const backTo: Partial<Record<Step, Step>> = {
    "c-info": "c-need",
    "c-form": "c-need",
    "s-nogst": "s-gst",
    "s-form": "s-gst",
  };

  let sheetBody: ReactNode = null;
  switch (step) {
    case "c-need":
      sheetBody = (
        <>
          {heading("आपको क्या चाहिए?", "What do you need?")}
          <div className={s.choices}>
            {choice("फ़ोन का दाम और EMI जानना है, मुझे कॉल करें", "Phone price and EMI details. Call me.", () => go("c-form"), true)}
            {choice("अभी बस जानकारी चाहिए", "Just information for now", () => go("c-info"))}
          </div>
        </>
      );
      break;
    case "c-info":
      sheetBody = (
        <>
          {heading("ऐसे मिलता है फ़ोन EMI पर", "How it works")}
          <ol className={s.steps}>
            <li>
              अपनी नज़दीकी पार्टनर दुकान पर जाएँ और फ़ोन चुनें।
              <span lang="en">Visit a partner shop near you and pick a phone.</span>
            </li>
            <li>
              आधार, पैन और बैंक डिटेल दिखाएँ। क्रेडिट कार्ड नहीं चाहिए।
              <span lang="en">Show your Aadhaar, PAN and bank details. No credit card needed.</span>
            </li>
            <li>
              डाउन पेमेंट दें और फ़ोन घर ले जाएँ। बाक़ी 6, 8 या 10 महीने की किस्तों में।
              <span lang="en">Pay the down payment and take the phone home. The rest over 6, 8 or 10 months.</span>
            </li>
          </ol>
          <div className={s.links}>
            <a className={s.linkBtn} href="/stores">
              पास की दुकान खोजें <small lang="en">Find a shop near you</small>
            </a>
            <a className={s.linkBtn} href="/hi">
              पूरी जानकारी वेबसाइट पर <small lang="en">Full details on our website</small>
            </a>
          </div>
          <button type="button" className={s.textBtn} onClick={() => go("c-form")}>
            मुझे कॉल भी चाहिए <span lang="en">· I would like a call too</span>
          </button>
        </>
      );
      break;
    case "c-form":
      sheetBody = (
        <>
          {heading("हम आपको कॉल करेंगे", "We will call you")}
          {leadForm}
        </>
      );
      break;
    case "s-gst":
      sheetBody = (
        <>
          {heading("क्या आपकी दुकान का GST रजिस्ट्रेशन है?", "Does your shop have a GST registration?")}
          <div className={s.choices}>
            {choice("हाँ, है", "Yes, it does", () => go("s-form"), true)}
            {choice("नहीं है", "No, it does not", () => go("s-nogst"))}
          </div>
          <p className={s.assure}>
            हम यहाँ आपका GST नंबर नहीं माँगते। <span lang="en">We do not ask for the number here.</span>
          </p>
        </>
      );
      break;
    case "s-nogst":
      sheetBody = (
        <>
          {heading("पहले GST रजिस्ट्रेशन करा लें", "Please get a GST registration first")}
          <p className={s.para}>
            पार्टनर दुकान बनने के लिए GST रजिस्ट्रेशन ज़रूरी है। रजिस्ट्रेशन मिल जाए तो इसी पेज पर वापस आइए, हम आपको जोड़ने
            की प्रक्रिया शुरू करेंगे।
          </p>
          <p className={s.para} lang="en">
            A GST registration is needed to become a partner shop. Once you have it, come back to this page and we will
            start your onboarding.
          </p>
          <p className={s.note}>
            हमने आपकी दुकान की कोई जानकारी सेव नहीं की है।{" "}
            <span lang="en">We have not saved any details about your shop.</span>
          </p>
          <div className={s.links}>
            <a className={s.linkBtn} href="https://www.gst.gov.in/" target="_blank" rel="noopener noreferrer">
              सरकारी GST पोर्टल <small lang="en">gst.gov.in, the official portal</small>
            </a>
          </div>
          <button type="button" className={s.textBtn} onClick={closeSheet}>
            ठीक है <span lang="en">· Close</span>
          </button>
        </>
      );
      break;
    case "s-form":
      sheetBody = (
        <>
          {heading("अपनी दुकान के बारे में बताएँ", "Tell us about your shop")}
          {leadForm}
        </>
      );
      break;
    case "done":
      sheetBody = (
        <div className={s.done}>
          <svg className={s.tick} viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
            <circle cx="32" cy="32" r="30" />
            <path d="M19 33l9 9 17-19" />
          </svg>
          {heading("धन्यवाद! आपकी जानकारी मिल गई।", "Thank you. We have your details.")}
          <p className={s.para}>
            {who === "shop"
              ? "हमारी टीम जल्द ही आपको कॉल करके आगे की प्रक्रिया बताएगी।"
              : "हमारी टीम जल्द ही आपको कॉल करेगी। फ़ोन पास रखें।"}
          </p>
          <p className={s.para} lang="en">
            {who === "shop"
              ? "Our team will call you soon and explain the next steps."
              : "Our team will call you soon. Keep your phone nearby."}
          </p>
          <div className={s.links}>
            {who === "customer" && (
              <a className={s.linkBtn} href="/stores">
                पास की दुकान देखें <small lang="en">See shops near you</small>
              </a>
            )}
            <button type="button" className={s.linkBtn} onClick={closeSheet}>
              ठीक है <small lang="en">Done</small>
            </button>
          </div>
        </div>
      );
      break;
  }

  return (
    <div
      ref={rootRef}
      className={s.root}
      lang="hi"
      data-live={live ? "" : undefined}
      data-gl={gl}
      data-sheet={step ? "" : undefined}
    >
      <div className={s.progress} aria-hidden="true">
        <span ref={barRef} />
      </div>

      <canvas ref={canvasRef} className={s.stage} aria-hidden="true" />

      {/* The flat phone: what handsets without usable 3D see instead. */}
      <div className={s.flat} aria-hidden="true">
        <div className={s.flatScreen}>
          <span className={s.flatBrand}>Credit Speed</span>
          <span className={s.flatRing}>EMI</span>
          <span className={s.flatLine}>नया फ़ोन</span>
          <span className={s.flatSub}>आसान किस्तों पर</span>
        </div>
      </div>

      <header className={s.top}>
        <a href="/" className={s.brand} lang="en">
          Credit Speed
        </a>
      </header>

      <main className={s.story} ref={storyRef}>
        {CHAPTERS.map((c, i) => (
          <section
            key={i}
            className={s.ch}
            data-on={active === i ? "" : undefined}
            ref={(el) => {
              sections.current[i] = el;
            }}
          >
            <div
              className={s.copy}
              ref={(el) => {
                copies.current[i] = el;
              }}
            >
              {c.tag ? <p className={s.step}>{c.tag}</p> : <p className={s.eyebrow}>कानपुर · उत्तर प्रदेश</p>}
              {i === 0 ? <h1>{c.title}</h1> : <h2>{c.title}</h2>}
              <p className={s.en} lang="en">
                {c.en}
              </p>
              <p className={s.lede}>{c.lede}</p>
              <p className={`${s.en} ${s.ledeEn}`} lang="en">
                {c.ledeEn}
              </p>
              {i === 0 && (
                <p className={s.hint}>
                  नीचे स्क्रॉल करें
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </p>
              )}
            </div>
          </section>
        ))}
      </main>

      {/* Below the last chapter, in its own space, so it never crowds the phone. */}
      <footer className={s.legal}>
        <p>
          लोन RBI में रजिस्टर्ड NBFC पार्टनर देते हैं। Credit Speed एक टेक्नोलॉजी प्लेटफ़ॉर्म है और खुद लोन नहीं देता। लोन की मंज़ूरी
          ऋणदाता की शर्तों पर निर्भर है।
        </p>
        <p lang="en">
          Loans are provided by RBI-registered NBFC partners. Credit Speed is a technology platform and does not lend
          directly. Loan approval is subject to the lender&apos;s terms.
        </p>
        <p lang="en">
          <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/">creditspeed.in</a>
        </p>
      </footer>

      <div className={s.dots} aria-hidden="true">
        {CHAPTERS.map((_, i) => (
          <span key={i} data-on={active === i ? "" : undefined} />
        ))}
      </div>

      <div ref={dockRef} className={s.dock} data-last={active === CHAPTERS.length - 1 ? "" : undefined}>
        {sent && (
          <p className={s.dockNote} role="status">
            आपकी जानकारी हमें मिल गई है। हमारी टीम कॉल करेगी। <span lang="en">We have your details. Our team will call.</span>
          </p>
        )}
        {canDialog ? (
          <div className={s.dockRow}>
            <button className={`${s.btn} ${s.primary}`} type="button" onClick={() => openSheet("c-need", "customer")}>
              मुझे फ़ोन चाहिए<small lang="en">I want a phone</small>
            </button>
            <button className={s.btn} type="button" onClick={() => openSheet("s-gst", "shop")}>
              मेरी दुकान है<small lang="en">I own a shop</small>
            </button>
          </div>
        ) : (
          <div className={s.dockRow}>
            <a
              className={`${s.btn} ${s.primary}`}
              href={`https://wa.me/${helplineWa}?text=${encodeURIComponent("नमस्ते, मुझे EMI पर फ़ोन के बारे में जानकारी चाहिए।")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              मुझे फ़ोन चाहिए<small lang="en">WhatsApp us</small>
            </a>
            <a
              className={s.btn}
              href={`https://wa.me/${helplineWa}?text=${encodeURIComponent("नमस्ते, मुझे अपनी दुकान Credit Speed से जोड़नी है।")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              मेरी दुकान है<small lang="en">WhatsApp us</small>
            </a>
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className={s.sheet}
        hidden={!canDialog}
        aria-labelledby={`${uid}-title`}
        data-closing={closing ? "" : undefined}
        onClickCapture={(e) => {
          // The second half of a double-tap on a dock button must not answer a question.
          if (performance.now() - openedAt.current < TAP_GUARD_MS) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onClose={(e) => {
          if (busyRef.current) {
            // Closed natively mid-send (a second Back or Esc): keep it open.
            try {
              e.currentTarget.showModal();
            } catch {
              /* ignore */
            }
            return;
          }
          setStep(null);
          setClosing(false);
          // Closed with X, the backdrop or a button: drop the sheet's history entry too.
          if (history.state?.[SHEET_MARK]) history.back();
        }}
        onCancel={(e) => {
          // Esc or the Back button: close with the same animation, unless a save is in flight.
          e.preventDefault();
          closeSheet();
        }}
        onClick={(e) => {
          // A tap on the dimmed page behind the sheet closes it.
          if (e.target !== e.currentTarget) return;
          const r = e.currentTarget.getBoundingClientRect();
          const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (!inside) closeSheet();
        }}
      >
        <div className={s.sheetInner}>
          <div className={s.sheetBar}>
            {step && backTo[step] ? (
              <button type="button" className={s.iconBtn} onClick={() => go(backTo[step]!)} aria-label="पीछे जाएँ (Back)">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <span />
            )}
            <span className={s.grab} aria-hidden="true" />
            <button type="button" className={s.iconBtn} onClick={closeSheet} aria-label="बंद करें (Close)">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className={s.sheetBody} key={step ?? "closed"}>
            {sheetBody}
          </div>
        </div>
      </dialog>
    </div>
  );
}
