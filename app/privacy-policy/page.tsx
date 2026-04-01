import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ReraPedia",
  description: "ReraPedia privacy policy. How we collect, use, and protect your data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: April 1, 2026</p>

      <div className="prose prose-lg mt-8 max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
        <h2>1. Information We Collect</h2>
        <p>ReraPedia collects the following information to provide our services:</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email, phone number when you register.</li>
          <li><strong>Search Data:</strong> Your search queries and filters to improve search results.</li>
          <li><strong>Lead Form Data:</strong> Name, phone, email, budget when you submit interest in a project.</li>
          <li><strong>Usage Data:</strong> Pages visited, features used, browser type (via analytics).</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide RERA project data, trust scores, and search functionality.</li>
          <li>To process lead submissions and connect you with builders/brokers.</li>
          <li>To send project change alerts you've subscribed to.</li>
          <li>To improve our platform based on usage patterns.</li>
          <li>To process payments for subscriptions and lead purchases.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We share your data only in these cases:</p>
        <ul>
          <li><strong>Lead Distribution:</strong> When you submit a lead form, your name and phone are shared with the builder/broker associated with that project.</li>
          <li><strong>Payment Processing:</strong> Razorpay processes your payments. We do not store credit card details.</li>
          <li><strong>Legal Compliance:</strong> If required by law or court order.</li>
        </ul>
        <p>We never sell your personal data to third parties for marketing.</p>

        <h2>4. RERA Data</h2>
        <p>All RERA project data displayed on ReraPedia is sourced from publicly available state RERA portals. This data is public record under the RERA Act 2016. We aggregate and present it for informational purposes only.</p>

        <h2>5. Cookies</h2>
        <p>We use essential cookies for authentication and session management. Analytics cookies (PostHog/Plausible) help us understand usage patterns. You can disable non-essential cookies in your browser settings.</p>

        <h2>6. Data Security</h2>
        <p>We use industry-standard encryption (HTTPS/TLS), secure database hosting (Supabase with encryption at rest), and access controls to protect your data.</p>

        <h2>7. Your Rights</h2>
        <p>Under the Digital Personal Data Protection Act (DPDPA) 2023, you have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and data</li>
          <li>Withdraw consent for marketing communications</li>
        </ul>

        <h2>8. Contact Us</h2>
        <p>For privacy concerns, contact us at <a href="mailto:privacy@rerapedia.com">privacy@rerapedia.com</a>.</p>
      </div>
    </div>
  );
}
