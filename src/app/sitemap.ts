import type { MetadataRoute } from "next";

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
    { url: `${SITE}/stores/kanpur`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/partner`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
