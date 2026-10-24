/**
 * Informational guides.
 *
 * These target the questions people ask *before* they are ready to buy —
 * "can I get a phone on EMI without a credit card", "what documents do I
 * need". The store pages catch someone who has already decided; these catch
 * them earlier, and link onward.
 *
 * Everything here has to be true of how Credit Speed actually works. A guide
 * that overstates what gets approved would bring in people who then get
 * turned away at a shop, which costs the merchant their time and us theirs.
 */

export type Guide = {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  sections: { h: string; body: string[]; list?: string[] }[];
  faq: { q: string; a: string }[];
};

export const GUIDES: Record<string, Guide> = {
  "emi-without-credit-card": {
    title: "How to Buy a Mobile on EMI Without a Credit Card",
    description:
      "You do not need a credit card to buy a smartphone on EMI in India. Here is how no-cost consumer finance works at a mobile shop, what is checked, and what you need to bring.",
    eyebrow: "Guide",
    h1: "How to buy a mobile on EMI without a credit card",
    lede:
      "Most people in India do not have a credit card. That has never been a good reason to pay the full price of a phone up front — consumer durable finance exists exactly for this, and it runs through the mobile shop rather than a bank branch.",
    sections: [
      {
        h: "What people get wrong about phone EMI",
        body: [
          "The common assumption is that EMI means a credit card EMI — you buy the phone on a card, and the bank splits the payment over months. That route genuinely does need a card, and it is why so many people believe EMI is closed to them.",
          "Consumer durable finance is a different thing. A lender finances the specific phone at the point of sale. There is no card involved at any stage. The shop submits your application, a decision comes back while you wait, and you repay in monthly instalments from your bank account.",
        ],
      },
      {
        h: "What actually gets checked",
        body: [
          "Three things, in practice: that you are who you say you are, that the bank account is yours, and that the repayment is plausible given what the lender can see about you.",
        ],
        list: [
          "Identity — verified against your Aadhaar, using the mobile number linked to it",
          "PAN — the standard financial identifier in India, used for the credit check",
          "Bank account — where the instalments will be debited from",
        ],
      },
      {
        h: "What a credit history does and does not do",
        body: [
          "A formal credit history helps. Someone who has repaid a loan before is easier to assess than someone who has never borrowed, and that shows up in the decision.",
          "But a thin file is not the same as a bad one, and plenty of first-time borrowers are approved. If you have never taken a loan, the honest answer is that you will not know until the application is submitted — and submitting it at the shop takes a few minutes and costs nothing.",
        ],
      },
      {
        h: "How it works at the shop",
        body: [
          "You choose the phone, the shopkeeper fills in the application with your documents, and the decision comes back at the counter. If approved, you pay the down payment and take the phone home the same day.",
          "There is no separate branch visit, no file to post, and nothing to collect later.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I buy a mobile on EMI without a credit card?",
        a: "Yes. Consumer durable finance does not involve a credit card at any stage. You need Aadhaar, PAN and a bank account, and the application is submitted at the shop.",
      },
      {
        q: "Is a debit card EMI the same thing?",
        a: "No. Debit card EMI is offered by some banks to pre-selected customers on their own cards. Consumer durable finance is arranged through the shop and does not depend on your bank pre-approving you.",
      },
      {
        q: "Will applying affect my credit score?",
        a: "A loan application involves a credit check, which is recorded. One application is not something to worry about; repeatedly applying in a short period is worth avoiding.",
      },
      {
        q: "How long does approval take?",
        a: "Usually minutes, at the shop counter. You do not leave and come back.",
      },
    ],
  },

  "documents-required-for-mobile-emi": {
    title: "Documents Required for Mobile EMI in India",
    description:
      "The exact documents you need to buy a smartphone on EMI: Aadhaar, PAN and bank account details. What each one is for, and the small things that cause applications to be delayed.",
    eyebrow: "Guide",
    h1: "Documents required for mobile EMI",
    lede:
      "The list is short, and most people already have everything on it. What slows applications down is rarely a missing document — it is a detail on one of them that does not match.",
    sections: [
      {
        h: "What to bring",
        body: ["Three things. Nothing needs to be prepared, notarised or printed in advance."],
        list: [
          "Aadhaar card — and the mobile number linked to it, because verification happens on that number",
          "PAN card — used for the credit check",
          "Bank account details — the account the monthly instalments will be debited from",
        ],
      },
      {
        h: "The mobile number matters more than people expect",
        body: [
          "Aadhaar verification sends a one-time code to the mobile number registered against your Aadhaar. If that is an old number you no longer use, the application stops there — and it cannot be worked around at the shop.",
          "If you are not sure which number is linked, check before you go. Updating it means a visit to an Aadhaar centre, so it is worth knowing in advance rather than discovering it at the counter.",
        ],
      },
      {
        h: "Small mismatches that cause delays",
        body: [
          "Most rejections at the document stage are not about creditworthiness at all. They are about details that do not line up.",
        ],
        list: [
          "Name spelled differently on Aadhaar and PAN",
          "The bank account being in a different name — a parent's or spouse's account will not work",
          "An Aadhaar mobile number that is no longer in use",
          "A cheque or passbook where the account holder's name is not visible",
        ],
      },
      {
        h: "What you do not need",
        body: [
          "No credit card. No salary slip in most cases. No guarantor. No property documents. If someone asks you for a fee to process a phone EMI application, that is not how this works — the application itself costs nothing.",
        ],
      },
    ],
    faq: [
      {
        q: "What documents are required for mobile EMI?",
        a: "Aadhaar card, PAN card and bank account details. Bring the mobile number linked to your Aadhaar, since verification happens on that number.",
      },
      {
        q: "Can I use my father's or wife's bank account?",
        a: "No. The bank account has to be in the name of the person taking the loan, because that is the account the instalments are debited from.",
      },
      {
        q: "Do I need a salary slip or income proof?",
        a: "Usually not for a phone. The amounts are small and the assessment is based on your identity and credit record rather than documented income.",
      },
      {
        q: "What if my Aadhaar mobile number is old?",
        a: "The verification code goes to that number, so the application cannot proceed without it. Updating it requires a visit to an Aadhaar centre, so check before going to the shop.",
      },
      {
        q: "Is there a fee to apply?",
        a: "No. Applying costs nothing. Anyone asking for a fee to process a mobile EMI application is not operating legitimately.",
      },
    ],
  },
};
