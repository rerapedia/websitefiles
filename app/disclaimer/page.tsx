import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | ReraPedia",
  description: "ReraPedia data disclaimer. Information about RERA data sourcing, accuracy, and limitations.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Disclaimer</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: April 1, 2026</p>

      <div className="prose prose-lg mt-8 max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
        <h2>RERA Data Source</h2>
        <p>All real estate project data displayed on ReraPedia is sourced from publicly available records on state Real Estate Regulatory Authority (RERA) portals, including but not limited to:</p>
        <ul>
          <li>Haryana RERA — haryanarera.gov.in</li>
          <li>Delhi RERA — erera.co.in</li>
          <li>UP RERA — up-rera.in</li>
          <li>MahaRERA — maharera.maharashtra.gov.in</li>
          <li>Karnataka RERA — rera.karnataka.gov.in</li>
        </ul>
        <p>Source attribution: "Data sourced from public RERA records under the Real Estate (Regulation and Development) Act, 2016."</p>

        <h2>Not Government Affiliated</h2>
        <p>ReraPedia is an independent private platform and is NOT affiliated with, endorsed by, or connected to any state RERA authority, central government body, or any other government entity.</p>

        <h2>Data Accuracy</h2>
        <p>While we make every effort to keep data accurate and up-to-date through daily automated scraping, we cannot guarantee:</p>
        <ul>
          <li>100% accuracy of all data points</li>
          <li>Real-time synchronization with state RERA portals</li>
          <li>Completeness of records for every state and district</li>
        </ul>
        <p><strong>Always verify information independently with the respective state RERA authority before making any investment decisions.</strong></p>

        <h2>Trust Scores</h2>
        <p>ReraPedia Trust Scores are algorithmic calculations based on publicly available RERA data and do NOT constitute:</p>
        <ul>
          <li>Financial advice or investment recommendations</li>
          <li>Official RERA compliance ratings</li>
          <li>Guarantees of builder reliability or project completion</li>
        </ul>

        <h2>No Investment Advice</h2>
        <p>Nothing on this platform should be construed as investment advice. Real estate investments carry inherent risks. Consult qualified financial and legal advisors before making property purchase decisions.</p>

        <h2>Contact</h2>
        <p>For data correction requests or concerns, email <a href="mailto:data@rerapedia.com">data@rerapedia.com</a>.</p>
      </div>
    </div>
  );
}
