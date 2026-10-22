/**
 * Organisation and service markup for search engines.
 *
 * This is what lets Google show the business properly in a knowledge panel and
 * understand that Credit Speed is a financial service operating in specific
 * Uttar Pradesh cities — which matters far more than keywords for a local,
 * intent-driven search like "mobile EMI near me".
 *
 * Statutory identifiers are included deliberately: for a lending business,
 * verifiable company details are a trust signal to both users and search.
 */
const SITE = "https://creditspeed.in";

const data = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": `${SITE}/#organization`,
      name: "Credit Speed Microfinance Private Limited",
      alternateName: "Credit Speed",
      url: SITE,
      description:
        "Smartphone EMI financing for customers across Uttar Pradesh, offered through a network of partner mobile retailers.",
      slogan: "Smartphone EMI without a credit card",
      identifier: [
        { "@type": "PropertyValue", name: "CIN", value: "U64990RJ2026PTC113256" },
        { "@type": "PropertyValue", name: "GSTIN", value: "09AANCC7212N1Z6" },
      ],
      telephone: "+91-88249-20949",
      email: "admin@creditspeed.in",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Plot No. F-7/136, Swaroop Nagar",
        addressLocality: "Kanpur",
        addressRegion: "Uttar Pradesh",
        postalCode: "208025",
        addressCountry: "IN",
      },
      areaServed: [
        { "@type": "City", name: "Kanpur" },
        { "@type": "City", name: "Lucknow" },
        { "@type": "State", name: "Uttar Pradesh" },
      ],
      currenciesAccepted: "INR",
      priceRange: "₹₹",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "admin@creditspeed.in",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      makesOffer: {
        "@type": "Offer",
        name: "Smartphone EMI financing",
        description:
          "Buy a smartphone on monthly instalments with a down payment and no credit card requirement.",
        category: "Consumer durable financing",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Credit Speed",
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
