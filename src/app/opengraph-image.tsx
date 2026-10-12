import { ImageResponse } from "next/og";

/**
 * The card shown when creditspeed.in is shared on WhatsApp, LinkedIn or X.
 * Without one, a shared link renders as a bare URL — which for a lending
 * business reads as untrustworthy at exactly the moment someone is deciding
 * whether to click. Generated at build time, no asset to maintain.
 */
export const alt = "Credit Speed — smartphone EMI without a credit card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #0A1628 0%, #13243E 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            color: "#C39236",
            textTransform: "uppercase",
          }}
        >
          Credit Speed
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 950,
          }}
        >
          Smartphone EMI without a credit card
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "rgba(255,255,255,0.65)",
            marginTop: 30,
          }}
        >
          Kanpur · Lucknow · across Uttar Pradesh
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "rgba(255,255,255,0.4)",
            marginTop: 56,
          }}
        >
          creditspeed.in
        </div>
      </div>
    ),
    size
  );
}
