import type { Metadata } from "next";
import { Shield, Search, BarChart3, Users, Globe, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About ReraPedia | India's RERA Transparency Platform",
  description: "ReraPedia aggregates RERA data from 5 states, scores 3,200+ projects, and helps home buyers make informed decisions. Learn about our mission and methodology.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About ReraPedia — India's RERA Transparency Platform",
    description: "Learn about ReraPedia's mission to make real estate data accessible and trustworthy.",
    url: "/about",
    type: "website",
  },
};

export default function AboutPage() {
  const features = [
    { icon: Search, title: "3,200+ RERA Projects", desc: "Comprehensive data from Haryana, Delhi, UP, Maharashtra, and Karnataka RERA portals." },
    { icon: Shield, title: "8-Dimension Trust Score", desc: "Our proprietary scoring evaluates delivery, compliance, legal risk, financials, and more." },
    { icon: BarChart3, title: "Builder Comparison", desc: "Compare any builders side-by-side on trust scores, delivery record, and complaint history." },
    { icon: Users, title: "Lead Marketplace", desc: "Builders and brokers access qualified buyer leads with transparent pricing." },
    { icon: Globe, title: "Hindi + English", desc: "Full platform available in Hindi for 50%+ of NCR home buyers who search in Hindi." },
    { icon: Zap, title: "Daily Data Updates", desc: "Automated scrapers update project data daily from official RERA portals." },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">About ReraPedia</h1>
        <p className="mt-4 text-lg text-gray-600">
          India's first dedicated RERA transparency and intelligence platform.
          We make real estate data accessible, searchable, and trustworthy.
        </p>
      </div>

      {/* Mission */}
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-light p-8 text-white">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="mt-3 text-blue-100">
          India has 30+ state RERA websites, each with different formats, broken search, and poor UX.
          Home buyers have no single source to verify builder track records, project compliance, or delay history.
          ReraPedia solves this by aggregating, scoring, and presenting RERA data in one fast, searchable platform.
        </p>
      </div>

      {/* Features */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <f.icon className="h-8 w-8 text-brand-primary" />
            <h3 className="mt-3 font-semibold text-gray-900">{f.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mt-12">
        <h2 className="text-center text-2xl font-bold text-gray-900">How It Works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "We Scrape RERA Portals", desc: "Automated scrapers collect data from haryanarera.gov.in, erera.co.in, up-rera.in, and maharera.maharashtra.gov.in daily." },
            { step: "2", title: "We Score Every Project", desc: "Our 8-dimension algorithm calculates a 0-100 Trust Score based on delivery, compliance, legal risk, and more." },
            { step: "3", title: "You Make Smart Decisions", desc: "Search, compare, and verify any RERA project or builder before investing your hard-earned money." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-light text-xl font-bold text-white">
                {s.step}
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 rounded-2xl bg-gray-50 p-6">
        <h2 className="font-semibold text-gray-900">Important Disclaimer</h2>
        <p className="mt-2 text-sm text-gray-600">
          ReraPedia is an independent platform and is NOT affiliated with any state RERA authority or government body.
          All data is sourced from publicly available RERA records. Trust scores are algorithmic calculations and do not
          constitute financial or investment advice. Always verify information independently before making property purchase decisions.
        </p>
      </div>
    </div>
  );
}
