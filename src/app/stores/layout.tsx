import type { Metadata } from "next";

/**
 * The page itself is a client component, which cannot export metadata.
 * This route layout carries it instead — no component split needed.
 */
export const metadata: Metadata = {
  title: "Find a Mobile Shop Near You",
  description:
    "Locate mobile shops near you in Kanpur, Lucknow and across Uttar Pradesh where you can buy a smartphone on EMI with Credit Speed.",
  alternates: { canonical: "/stores" },
  openGraph: {
    title: "Find a Mobile Shop Near You | Credit Speed",
    description: "Locate mobile shops near you in Kanpur, Lucknow and across Uttar Pradesh where you can buy a smartphone on EMI with Credit Speed.",
    url: "/stores",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
