import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChatWidget from "@/components/ChatWidget";
import StructuredData from "@/components/StructuredData";

const SITE = "https://creditspeed.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Smartphone EMI Without a Credit Card — Kanpur & Uttar Pradesh",
    // Every other page sets its own title; this frames it.
    template: "%s | Credit Speed",
  },
  description:
    "Buy a mobile phone on EMI in Kanpur, Lucknow and across Uttar Pradesh — no credit card needed. Approval in minutes at your nearest partner shop, finance by an RBI-registered NBFC.",
  keywords: [
    "smartphone EMI",
    "mobile phone EMI Kanpur",
    "mobile EMI without credit card",
    "phone finance Uttar Pradesh",
    "mobile loan Lucknow",
    "EMI without CIBIL score",
    "mobile shop EMI partner",
  ],
  applicationName: "Credit Speed",
  authors: [{ name: "Credit Speed Microfinance Private Limited" }],
  creator: "Credit Speed Microfinance Private Limited",
  publisher: "Credit Speed Microfinance Private Limited",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Credit Speed",
    locale: "en_IN",
    url: SITE,
    title: "Smartphone EMI Without a Credit Card — Kanpur & Uttar Pradesh",
    description:
      "Buy a mobile phone on EMI with no credit card. Approval in minutes at your nearest partner shop across Uttar Pradesh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smartphone EMI Without a Credit Card — Credit Speed",
    description:
      "Mobile phone EMI in Kanpur, Lucknow and across Uttar Pradesh. No credit card required.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "finance",
};

// No-flash theme script — runs BEFORE hydration so the page paints in the
// correct theme on first frame. Defaults to LIGHT (only honors a stored
// preference if the user has explicitly toggled).
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('cs-theme');
    var theme = stored || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <StructuredData />
      </head>
      <body className="antialiased grain">
        <ThemeProvider>{children}</ThemeProvider>
        <ChatWidget />
      </body>
    </html>
  );
}
