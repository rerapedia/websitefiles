import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { Briefcase, GitCompareArrows, Bell, FileDown } from "lucide-react";

export const metadata: Metadata = { title: "Investor Dashboard" };

export default async function InvestorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=/dashboard/investor");

  const portfolioCount = await prisma.userSavedProject.count({
    where: { userId: user.id },
  });

  const cards = [
    { href: "/dashboard/investor/portfolio", label: "My Portfolio", desc: `${portfolioCount} properties tracked`, icon: Briefcase },
    { href: "/dashboard/investor/compare-builders", label: "Compare Builders", desc: "Side-by-side builder analysis", icon: GitCompareArrows },
    { href: "/dashboard/investor/compare-projects", label: "Compare Projects", desc: "Compare trust scores & metrics", icon: GitCompareArrows },
    { href: "/dashboard/investor/alerts", label: "Alert Settings", desc: "Score drops, delays, complaints", icon: Bell },
    { href: "/dashboard/investor/reports", label: "PDF Reports", desc: "Download branded reports", icon: FileDown },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">Premium analytics and portfolio tracking</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="flex items-center gap-4 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] p-5 hover:border-brand-primary hover:shadow-sm">
            <card.icon className="h-8 w-8 text-brand-primary" />
            <div>
              <h3 className="font-semibold text-gray-900">{card.label}</h3>
              <p className="text-sm text-gray-600">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
