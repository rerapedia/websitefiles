import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ReraPedia",
  description: "ReraPedia terms of service. Platform usage terms, subscription policies, and data disclaimer.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: April 1, 2026</p>

      <div className="prose prose-lg mt-8 max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing ReraPedia, you agree to these terms. If you disagree, please do not use the platform.</p>

        <h2>2. Platform Description</h2>
        <p>ReraPedia is a RERA transparency and intelligence platform that aggregates publicly available real estate regulatory data from state RERA portals across India. We provide trust scores, builder profiles, project analysis, and related services.</p>

        <h2>3. Data Accuracy Disclaimer</h2>
        <p><strong>Important:</strong> All RERA data on ReraPedia is sourced from public state RERA portals. While we strive for accuracy, we cannot guarantee the completeness or real-time accuracy of this data. Always verify information independently with the respective state RERA authority before making investment decisions.</p>
        <p>Trust scores are algorithmic calculations based on available data and should not be considered financial or investment advice.</p>

        <h2>4. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account. You must provide accurate information during registration. We reserve the right to suspend accounts that violate these terms.</p>

        <h2>5. Subscriptions & Payments</h2>
        <ul>
          <li>Subscriptions are billed monthly via Razorpay.</li>
          <li>Refunds are available within 7 days of purchase if no leads have been accessed.</li>
          <li>Lead purchases are non-refundable once buyer contact details are revealed.</li>
          <li>Auto-renewal can be cancelled at any time from your dashboard.</li>
        </ul>

        <h2>6. Lead Generation</h2>
        <p>When buyers submit interest through our lead forms, their information is shared with the associated builder or broker. Builders and brokers must handle lead data responsibly and in compliance with applicable privacy laws.</p>

        <h2>7. Advertising</h2>
        <p>All sponsored content and advertisements are clearly labeled. ReraPedia reserves the right to approve or reject ad creatives. Advertising does not influence trust scores or rankings.</p>

        <h2>8. Prohibited Activities</h2>
        <ul>
          <li>Scraping or automated data extraction without permission</li>
          <li>Creating fake accounts or submitting false lead information</li>
          <li>Misrepresenting your identity or builder/broker status</li>
          <li>Using the platform to defame builders or projects without factual basis</li>
        </ul>

        <h2>9. Intellectual Property</h2>
        <p>ReraPedia's trust scoring methodology, UI design, and content are proprietary. RERA data itself is public record.</p>

        <h2>10. Limitation of Liability</h2>
        <p>ReraPedia is not liable for investment decisions made based on data displayed on the platform. We are an information aggregator, not a financial advisor.</p>

        <h2>11. Contact</h2>
        <p>For questions about these terms, contact <a href="mailto:legal@rerapedia.com">legal@rerapedia.com</a>.</p>
      </div>
    </div>
  );
}
