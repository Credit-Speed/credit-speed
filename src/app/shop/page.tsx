import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopClient from "@/components/ShopClient";
import { PHONES, DEFAULT_TENURE, SHOP_LIVE, quote } from "@/data/phones";
import shopData from "@/data/partner-shops.json";

const SHOPS = (shopData.shops as unknown[]).length;
// Only quote a figure when the catalogue behind it is being published.
const FROM_EMI = SHOP_LIVE
  ? quote(Math.min(...PHONES.map((p) => p.price)), DEFAULT_TENURE).emi
  : null;

export const metadata: Metadata = SHOP_LIVE
  ? {
      title: "Buy a Phone on EMI — Mobile EMI Shop in Kanpur",
      description:
        "Pick a smartphone, see the monthly instalment, and we will tell you the nearest partner shop in Kanpur that has it. No credit card needed — Aadhaar, PAN and a bank account are enough.",
      alternates: { canonical: "/shop" },
      openGraph: {
        title: "Buy a Phone on EMI | Credit Speed",
        description:
          "Choose a phone, check the monthly instalment, and get a call back with your nearest partner shop in Kanpur.",
        url: "/shop",
      },
    }
  : {
      title: "Buy a Phone on EMI — Coming Soon | Credit Speed",
      description:
        "Phone-by-phone EMI pricing is coming soon. In the meantime, find your nearest Credit Speed partner shop in Kanpur, or talk to us about financing a handset.",
      alternates: { canonical: "/shop" },
      // Don't rank a page that cannot yet answer the search behind it.
      robots: { index: false, follow: true },
    };

export default function ShopPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://creditspeed.in/" },
          { "@type": "ListItem", position: 2, name: "Shop", item: "https://creditspeed.in/shop" },
        ],
      },
    ],
  };

  return (
    <main className="bg-[#050B17] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="pt-36 pb-12 px-6 lg:px-12 text-center">
        <p className="text-gold-400/80 text-xs font-medium tracking-[0.25em] uppercase mb-5">
          {SHOP_LIVE && FROM_EMI
            ? `EMI from ₹${new Intl.NumberFormat("en-IN").format(FROM_EMI)} a month`
            : "Coming soon"}
        </p>
        <h1 className="font-display text-white text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[1.02] max-w-4xl mx-auto">
          Pick your phone.{" "}
          <span className="bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
            Pay monthly.
          </span>
        </h1>
        <p className="text-white/55 text-base leading-relaxed max-w-2xl mx-auto mt-7">
          {SHOP_LIVE ? (
            <>
              Choose a phone, see what it costs each month, and leave your number. We will
              tell you which of our {SHOPS} partner shops in Kanpur has it — no credit card
              needed.
            </>
          ) : (
            <>
              We finance smartphones at {SHOPS} partner shops across Kanpur — no credit card
              needed. The handset list and monthly instalments are on their way here.
            </>
          )}
        </p>
      </section>

      <section className="pb-24 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          {SHOP_LIVE ? (
            <ShopClient />
          ) : (
            <div className="max-w-2xl mx-auto text-center rounded-2xl border border-white/10 p-10">
              <h2 className="font-display text-white text-2xl sm:text-3xl tracking-tighter">
                Phones and instalments, coming soon
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mt-4">
                We are finalising the handset list with our partner shops so that every
                price shown here is the price you pay at the counter. Until then we would
                rather show you nothing than a number the shopkeeper has to argue with.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <Link
                  href="/stores/kanpur"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#050B17] text-sm font-semibold"
                >
                  Find your nearest shop
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12 border-t border-white/5 text-center">
        <h2 className="font-display text-white text-2xl sm:text-3xl tracking-tighter mb-4">
          What you need to bring
        </h2>
        <p className="text-white/55 text-sm max-w-xl mx-auto mb-8">
          Aadhaar card, PAN card and your bank account details. Bring the mobile number
          linked to your Aadhaar — verification happens on that number.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/guides/documents-required-for-mobile-emi"
            className="px-6 py-3 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
          >
            Read the full list
          </Link>
          <Link
            href="/stores/kanpur"
            className="px-6 py-3 rounded-full border border-white/15 text-white/80 text-sm font-semibold"
          >
            Find a shop near you
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
