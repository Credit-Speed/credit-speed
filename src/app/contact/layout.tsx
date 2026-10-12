import type { Metadata } from "next";

/**
 * The page itself is a client component, which cannot export metadata.
 * This route layout carries it instead — no component split needed.
 */
export const metadata: Metadata = {
  title: "Contact Us — Kanpur Office & Customer Support",
  description:
    "Speak to the Credit Speed team in Kanpur about smartphone EMI, your existing loan, or partnering your mobile shop with us.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — Kanpur Office & Customer Support | Credit Speed",
    description: "Speak to the Credit Speed team in Kanpur about smartphone EMI, your existing loan, or partnering your mobile shop with us.",
    url: "/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
