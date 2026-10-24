import type { MetadataRoute } from "next";
import shopData from "@/data/partner-shops.json";

const SITE = "https://creditspeed.in";

/**
 * Priorities reflect commercial intent, not page size. The store locator ranks
 * alongside the homepage because "mobile shop near me" is how this customer
 * actually searches; the legal pages are listed so they are indexed, but they
 * are not what we want ranking.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/stores`,  lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    // One per city with partner shops. A new city appears here automatically
    // once its first shop is in the snapshot; nobody has to remember.
    ...[...new Set((shopData.shops as { city: string }[]).map((s) => s.city))].map(
      (city) => ({
        url: `${SITE}/stores/${city.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })
    ),
    ...[...new Set((shopData.shops as { city: string }[]).map((s) => s.city))].map(
      (city) => ({
        url: `${SITE}/hi/stores/${city.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    ),
    { url: `${SITE}/hi`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    // The guides answer what people search before they are ready to buy, so
    // they rank for different queries than the store pages and are worth
    // their own entries.
    { url: `${SITE}/guides/emi-without-credit-card`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/guides/documents-required-for-mobile-emi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/partner`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
