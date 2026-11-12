import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import StartExperience from "@/components/start/StartExperience";
import { HELPLINE, HELPLINE_WA } from "@/lib/chat-knowledge";
import "@/components/start/fonts.css";

/**
 * creditspeed.in/start — where the Instagram, YouTube and WhatsApp links land.
 *
 * One job: find out whether the visitor wants a phone or owns a shop, and get
 * a number our team can call. Hindi first.
 *
 * The two fonts are files in /public/fonts/start, declared in fonts.css. They
 * are deliberately not fetched from Google — neither by the visitor's browser
 * nor by the build.
 */
export const metadata: Metadata = {
  title: "नया फ़ोन, आसान EMI पर",
  description:
    "बिना क्रेडिट कार्ड के मोबाइल EMI पर लें। आधार, पैन और बैंक अकाउंट से, अपनी नज़दीकी पार्टनर दुकान पर।",
  alternates: { canonical: "/start" },
  // An ad landing page: it should not compete with the home page in search.
  robots: { index: false, follow: true },
  openGraph: {
    title: "नया फ़ोन, आसान EMI पर | Credit Speed",
    description: "बिना क्रेडिट कार्ड के मोबाइल EMI पर लें। अपनी नज़दीकी पार्टनर दुकान पर।",
    url: "/start",
    locale: "hi_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#050B17",
  colorScheme: "dark",
  viewportFit: "cover",
  // When the keyboard opens, shrink the page instead of covering the form.
  interactiveWidget: "resizes-content",
};

/** The names fonts.css gives the two faces. The 3D phone's screen draws with them too. */
const FONTS = { display: '"CS Anek"', body: '"CS Hind"' };

export default function StartPage() {
  // The headline is the first thing anyone reads; fetch its font straight away.
  preload("/fonts/start/anek-devanagari-500-800.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return <StartExperience fonts={FONTS} helpline={HELPLINE} helplineWa={HELPLINE_WA} />;
}
