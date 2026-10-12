import type { Metadata } from "next";

/**
 * The page itself is a client component, which cannot export metadata.
 * This route layout carries it instead — no component split needed.
 */
export const metadata: Metadata = {
  title: "Partner With Us — EMI for Mobile Retailers",
  description:
    "Grow your mobile shop with Credit Speed. Offer smartphone EMI to walk-in customers, get paid upfront, and close more sales across Uttar Pradesh.",
  alternates: { canonical: "/partner" },
  openGraph: {
    title: "Partner With Us — EMI for Mobile Retailers | Credit Speed",
    description: "Grow your mobile shop with Credit Speed. Offer smartphone EMI to walk-in customers, get paid upfront, and close more sales across Uttar Pradesh.",
    url: "/partner",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
