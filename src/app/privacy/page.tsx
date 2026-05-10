import LegalPage from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="April 2026"
      sections={[
        {
          heading: "1. Information We Collect",
          body: "We collect personal information including name, phone number, email, PAN, Aadhaar, and bank details necessary for KYC verification and loan processing. This data is collected during retailer onboarding and customer loan applications.",
        },
        {
          heading: "2. How We Use Your Information",
          body: "We use your information to verify identity, process loan applications through our NBFC partners, provide customer support, and improve our services. Your data is never sold to third parties.",
        },
        {
          heading: "3. Sharing with NBFC Partners",
          body: "Loan applications are shared with RBI-registered NBFC partners (such as Transwarranty Finance Ltd) for credit decisioning and disbursement. These partners follow strict data protection protocols.",
        },
        {
          heading: "4. Data Security",
          body: "We use enterprise-grade encryption, secure servers, and industry-standard protocols to protect your data. Access is restricted to authorized personnel only.",
        },
        {
          heading: "5. Your Rights",
          body: "You have the right to access, correct, or delete your personal data. You can request this by contacting us at admin@creditspeed.in.",
        },
        {
          heading: "6. Cookies",
          body: "Our website uses cookies to improve user experience and analyze traffic. You can control cookie preferences through your browser settings.",
        },
        {
          heading: "7. Contact Us",
          body: "For any privacy-related questions, please reach out to us at admin@creditspeed.in or visit our office in Lucknow, Uttar Pradesh.",
        },
      ]}
    />
  );
}
