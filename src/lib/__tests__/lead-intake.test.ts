/**
 * Rules for website leads. Run with `npm test` (Node's built-in runner; no
 * extra packages). Kept out of the type-check and the build via tsconfig.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanCampaign,
  fromOwnPage,
  ipBucket,
  maskIdentifiers,
  normaliseIndianMobile,
  parseAssistantLead,
  parseLandingLead,
} from "../lead-intake.ts";

const good = { who: "customer", name: "राम कुमार", city: "Kanpur", phone: "+91 98765 43210", consent: true };

test("mobile numbers", () => {
  assert.equal(normaliseIndianMobile("+91 98765 43210"), "9876543210");
  assert.equal(normaliseIndianMobile("098765-43210"), "9876543210");
  assert.equal(normaliseIndianMobile("919876543210"), "9876543210");
  assert.equal(normaliseIndianMobile(9876543210), "9876543210");
  assert.equal(normaliseIndianMobile("0512-2345678"), null);
  assert.equal(normaliseIndianMobile("5876543210"), null);
  assert.equal(normaliseIndianMobile("98765"), null);
  assert.equal(normaliseIndianMobile("9".repeat(40)), null);
  assert.equal(normaliseIndianMobile(null), null);
  assert.equal(normaliseIndianMobile({}), null);
});

test("campaign tag", () => {
  assert.equal(cleanCampaign("IG-EMI"), "ig-emi");
  assert.equal(cleanCampaign("yt-merchant"), "yt-merchant");
  assert.equal(cleanCampaign("<script>"), null);
  assert.equal(cleanCampaign("a b"), null);
  assert.equal(cleanCampaign("x".repeat(33)), null);
  assert.equal(cleanCampaign(5), null);
});

test("customer lead", () => {
  const r = parseLandingLead({ ...good, buying: "week", src: "ig-emi" });
  assert.ok(r.ok);
  assert.deepEqual(r.lead, {
    lead_type: "customer", phone: "9876543210", name: "राम कुमार", city: "Kanpur", shop_name: null,
    intent: "Landing page · wants a call about phone price and EMI · buying this week · ad: ig-emi", campaign: "ig-emi",
  });
  assert.equal(r.honeypot, false);
});

test("customer lead ignores a shop name and unknown choices", () => {
  const r = parseLandingLead({ ...good, shop_name: "X Mobiles", buying: "never", src: "bad tag" });
  assert.ok(r.ok);
  assert.equal(r.lead.shop_name, null);
  assert.equal(r.lead.campaign, null);
  assert.equal(r.lead.intent, "Landing page · wants a call about phone price and EMI");
});

test("only the which-phone field carries the visitor's own words", () => {
  const r = parseLandingLead({ ...good, intent: "DROP TABLE", note: "x" });
  assert.ok(r.ok);
  assert.ok(!r.lead.intent!.includes("DROP"));
});

test("which-phone field reaches the note, customer only, capped", () => {
  const r = parseLandingLead({ ...good, buying: "week", wants: "  Vivo Y28,  around ₹15,000 ", src: "ig-emi" });
  assert.ok(r.ok);
  assert.equal(
    r.lead.intent,
    "Landing page · wants a call about phone price and EMI · buying this week · wants: Vivo Y28, around ₹15,000 · ad: ig-emi",
  );
  const shop = parseLandingLead({ ...good, who: "shop", has_gst: true, shop_name: "Shri Mobiles", wants: "Vivo" });
  assert.ok(shop.ok);
  assert.ok(!shop.lead.intent!.includes("wants:"));
  const long = parseLandingLead({ ...good, wants: "x".repeat(400) });
  assert.ok(long.ok);
  assert.equal(long.lead.intent!.split("wants: ")[1].length, 150);
});

test("identifiers are blanked, prices and model names are not", () => {
  assert.equal(maskIdentifiers("my aadhaar 1234 5678 9012"), "my aadhaar [number removed]");
  assert.equal(maskIdentifiers("aadhaar 123456789012 ok"), "aadhaar [number removed] ok");
  assert.equal(maskIdentifiers("call 98765 43210"), "call [number removed]");
  assert.equal(maskIdentifiers("call +91 98765-43210"), "call +[number removed]");
  assert.equal(maskIdentifiers("call 09876543210"), "call [number removed]");
  assert.equal(maskIdentifiers("pan ABCDE1234F please"), "pan [number removed] please");
  assert.equal(maskIdentifiers("pan abcde1234f"), "pan [number removed]");
  assert.equal(maskIdentifiers("budget 10000-15000"), "budget 10000-15000");
  assert.equal(maskIdentifiers("Vivo Y28 ₹15,000, 128GB"), "Vivo Y28 ₹15,000, 128GB");
  assert.equal(maskIdentifiers("Redmi Note 13 Pro 5G"), "Redmi Note 13 Pro 5G");
  const r = parseLandingLead({ ...good, wants: "Vivo, my number 9876543210" });
  assert.ok(r.ok && r.lead.intent!.endsWith("wants: Vivo, my number [number removed]"));
  const a = parseAssistantLead({ phone: "9876543210", consent: true, intent: "aadhaar 1234-5678-9012" });
  assert.ok(a.ok && a.lead.intent === "aadhaar [number removed]");
});

test("shop owner", () => {
  const r = parseLandingLead({ ...good, who: "shop", has_gst: true, shop_name: "श्री मोबाइल्स" });
  assert.ok(r.ok);
  assert.equal(r.lead.lead_type, "retailer");
  assert.equal(r.lead.shop_name, "श्री मोबाइल्स");
  assert.equal(r.lead.intent, "Landing page · shop owner, says they have GST · wants to become a partner shop");
});

test("shop owner without GST is refused", () => {
  for (const has_gst of [false, undefined, "true", 1]) {
    const r = parseLandingLead({ ...good, who: "shop", has_gst, shop_name: "Shri Mobiles" });
    assert.ok(!r.ok);
    assert.equal(r.field, "has_gst");
  }
});

test("each required field", () => {
  const bad = (patch: object) => {
    const r = parseLandingLead({ ...good, ...patch });
    assert.ok(!r.ok);
    return r.field;
  };
  assert.equal(bad({ who: "admin" }), "who");
  assert.equal(bad({ name: " " }), "name");
  assert.equal(bad({ name: "1" }), "name");
  assert.equal(bad({ city: "" }), "city");
  assert.equal(bad({ phone: "12345" }), "phone");
  assert.equal(bad({ consent: "true" }), "consent");
  assert.equal(bad({ consent: false }), "consent");
  assert.equal(parseLandingLead({ ...good, who: "shop", has_gst: true }).ok, false);
  for (const b of [null, [], "x", 3]) assert.equal(parseLandingLead(b).ok, false);
});

test("text is cleaned and capped", () => {
  const r = parseLandingLead({ ...good, name: "  Ram\u0000\n  Kumar\u202e  ", city: "K".repeat(500) });
  assert.ok(r.ok);
  assert.equal(r.lead.name, "Ram Kumar");
  assert.equal(r.lead.city!.length, 80);
});

test("half an emoji left by the length cap is removed", () => {
  const r = parseLandingLead({ ...good, name: "Ram " + "a".repeat(115) + "\uD83D\uDE00" });
  assert.ok(r.ok);
  assert.equal(r.lead.name!.length, 119);
  assert.ok(!/[\uD800-\uDFFF]/u.test(r.lead.name!));
  const lone = parseLandingLead({ ...good, city: "Kan\uD83Dpur" });
  assert.ok(lone.ok);
  assert.equal(lone.lead.city, "Kanpur");
});

test("honeypot is reported, not refused; the old field name no longer counts", () => {
  const r = parseLandingLead({ ...good, hp_extra: "http://spam" });
  assert.ok(r.ok);
  assert.equal(r.honeypot, true);
  const old = parseLandingLead({ ...good, website: "x" });
  assert.ok(old.ok);
  assert.equal(old.honeypot, false);
});

test("assistant lead keeps its free-text note, capped", () => {
  const r = parseAssistantLead({ phone: "9876543210", consent: true, lead_type: "retailer", shop_name: "A1", intent: "x".repeat(900) });
  assert.ok(r.ok);
  assert.equal(r.lead.lead_type, "retailer");
  assert.equal(r.lead.intent!.length, 500);
  assert.equal(parseAssistantLead({ phone: "9876543210" }).ok, false);
  assert.equal(parseAssistantLead({ phone: "1", consent: true }).ok, false);
});

test("ip buckets", () => {
  assert.equal(ipBucket("203.0.113.9"), "203.0.113.9");
  assert.equal(ipBucket("203.0.113.9, 10.0.0.1"), "203.0.113.9");
  assert.equal(ipBucket("::ffff:203.0.113.9"), "203.0.113.9");
  assert.equal(ipBucket("2409:4063:4e1f:8a::1"), "2409:4063:4e1f:8a::/64");
  assert.equal(ipBucket("2409:4063:4e1f:008a:1111:2222:3333:4444"), "2409:4063:4e1f:8a::/64");
  assert.equal(ipBucket("::1"), "0:0:0:0::/64");
  assert.equal(ipBucket("fe80::1%eth0"), "fe80:0:0:0::/64");
  for (const junk of [null, "", "nonsense", "1:2:3", "a::b::c", "x".repeat(100)]) assert.equal(ipBucket(junk), "unknown");
});

test("own page", () => {
  const h = { origin: "https://creditspeed.in", host: "creditspeed.in", forwardedHost: null, secFetchSite: "same-origin" };
  assert.equal(fromOwnPage(h), true);
  assert.equal(fromOwnPage({ ...h, secFetchSite: null }), true);
  assert.equal(fromOwnPage({ ...h, secFetchSite: "cross-site" }), false);
  assert.equal(fromOwnPage({ ...h, secFetchSite: "same-site" }), false);
  assert.equal(fromOwnPage({ ...h, secFetchSite: "none" }), false);
  assert.equal(fromOwnPage({ ...h, origin: "https://evil.example", secFetchSite: null }), false);
  assert.equal(fromOwnPage({ ...h, origin: "null", secFetchSite: null }), false);
  assert.equal(fromOwnPage({ ...h, origin: null, secFetchSite: null }), true);
  assert.equal(
    fromOwnPage({ origin: "https://creditspeed.in", host: "internal:3000", forwardedHost: "creditspeed.in", secFetchSite: null }),
    true,
  );
});
