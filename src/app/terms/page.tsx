import LegalPage from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="April 2026"
      sections={[
        {
          heading: "1. Acceptance of Terms",
          body: "By accessing or using Credit Speed's services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
        },
        {
          heading: "2. Eligibility",
          body: "Users must be at least 18 years old and residents of India. Retailers must be registered businesses with valid GST, PAN, and bank documentation.",
        },
        {
          heading: "3. Services Description",
          body: "Credit Speed Microfinance Private Limited is a technology platform that connects mobile retailers with RBI-registered NBFC partners for smartphone EMI financing. We do not directly lend money.",
        },
        {
          heading: "4. NBFC Disclaimer",
          body: "All loans are provided by our RBI-registered NBFC partners, including Transwarranty Finance Ltd. Credit Speed acts as a technology platform and facilitator. Lending terms, interest rates, and approval decisions are at the sole discretion of the NBFC partner.",
        },
        {
          heading: "5. User Responsibilities",
          body: "You agree to provide accurate, current, and complete information. Misrepresentation may result in account termination and legal action.",
        },
        {
          heading: "6. Fees & Charges",
          body: "Applicable processing fees, interest rates, and charges are disclosed before loan approval. Late payment penalties, if any, will be communicated transparently.",
        },
        {
          heading: "7. Cancellation & Refunds",
          body: "Loan applications can be cancelled before disbursement without charges. Post-disbursement cancellation is subject to NBFC partner policies.",
        },
        {
          heading: "8. Limitation of Liability",
          body: "Credit Speed is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the fees paid by you.",
        },
        {
          heading: "9. Governing Law",
          body: "These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Lucknow, Uttar Pradesh.",
        },
        {
          heading: "10. Contact",
          body: "For questions regarding these terms, reach us at admin@creditspeed.in.",
        },
      ]}
    />
  );
}
