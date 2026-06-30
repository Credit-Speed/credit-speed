import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Credit Speed — Smartphone EMI Solutions for Bharat",
  description:
    "Credit Speed Microfinance Private Limited partners with mobile retailers across Uttar Pradesh to offer instant smartphone EMI financing. Powered by RBI-registered NBFCs.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased grain">
        <ThemeProvider>{children}</ThemeProvider>
        <ChatWidget />
      </body>
    </html>
  );
}
