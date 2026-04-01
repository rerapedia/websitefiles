import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { formatPaise } from "@/lib/utils/format";
import { Check } from "lucide-react";
import { RazorpayCheckout } from "@/components/payments/razorpay-checkout";

export const metadata: Metadata = {
  title: "Pricing - Subscription Plans for Builders, Brokers & Investors",
  description: "ReraPedia subscription plans starting ₹999/month. Builder dashboards, lead generation, broker CRM, investor analytics, and ad campaigns.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "ReraPedia Pricing - Plans for Builders, Brokers & Investors",
    description: "Subscription plans starting ₹999/month for builders, brokers, and investors.",
    url: "/pricing",
    type: "website",
  },
};

const FEATURE_LABELS: Record<string, string> = {
  savedProjectsLimit: "Unlimited saved projects",
  alertsSms: "SMS alerts",
  alertsEmail: "Email alerts",
  builderComparison: "Builder comparison tool",
  portfolioTracker: "Portfolio tracker",
  pdfReports: "PDF reports",
  adFree: "Ad-free experience",
  apiCallsPerDay: "API access",
  respondToReviews: "Respond to reviews",
  projectGalleries: "Project galleries",
  leadDashboard: "Lead dashboard",
  verifiedBadge: "Verified badge",
  basicAnalytics: "Basic analytics",
  featuredPlacement: "Featured search placement",
  sponsoredListings: "Sponsored listings",
  advancedAnalytics: "Advanced analytics",
  leadCreditsPerMonth: "Free lead credits/month",
  apiAccess: "API access",
  customPdfReports: "Custom PDF reports",
  verifiedAgentProfile: "Verified agent profile",
  leadMarketplace: "Lead marketplace",
  savedSearchAlerts: "Saved search alerts",
  clientCrm: "Client CRM",
  marketIntelligence: "Market intelligence",
  coBrandedReports: "Co-branded reports",
};

const PLAN_ORDER = ["investor-premium", "broker-plan", "builder-silver", "builder-gold"];

export default async function PricingPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const sortedPlans = PLAN_ORDER
    .map((slug) => plans.find((p) => p.slug === slug))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-2 text-gray-600">
          Unlock premium features for builders, brokers, and investors
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {sortedPlans.map((plan) => {
          if (!plan) return null;
          const features = (plan.featuresJson as Record<string, unknown>) ?? {};
          const featureList = Object.entries(features)
            .filter(([, v]) => v === true || (typeof v === "number" && v > 0))
            .map(([k, v]) => {
              const label = FEATURE_LABELS[k] ?? k;
              return typeof v === "number" ? `${v} ${label}` : label;
            });

          const isGold = plan.slug === "builder-gold";

          return (
            <div
              key={plan.id}
              className={`rounded-xl border p-6 ${
                isGold
                  ? "border-brand-primary bg-blue-50 ring-2 ring-brand-primary"
                  : "border-gray-100"
              }`}
            >
              {isGold && (
                <span className="mb-3 inline-block rounded-full bg-brand-primary px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPaise(plan.priceMonthlyPaise)}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                or {formatPaise(plan.priceAnnualPaise)}/year
              </p>

              <ul className="mt-6 space-y-2">
                {featureList.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-trust-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <RazorpayCheckout
                  planId={plan.id}
                  planName={plan.name}
                  isPopular={isGold}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
