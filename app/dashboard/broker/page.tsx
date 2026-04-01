import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { ShoppingCart, FileText, Search, UserCircle } from "lucide-react";

export const metadata: Metadata = { title: "Broker Dashboard" };

export default async function BrokerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login?callbackUrl=/dashboard/broker");
  if (user.role !== "BROKER") redirect("/dashboard/saved");

  const purchasedCount = await prisma.leadPurchase.count({
    where: { purchasedByUserId: user.id },
  });

  const newLeadsCount = await prisma.lead.count({
    where: { status: "NEW", purchases: { none: {} } },
  });

  const cards = [
    { href: "/dashboard/broker/leads", label: "Lead Marketplace", desc: `${newLeadsCount} available leads`, icon: ShoppingCart },
    { href: "/dashboard/broker/purchased", label: "My Purchased Leads", desc: `${purchasedCount} leads purchased`, icon: FileText },
    { href: "/dashboard/broker/searches", label: "Saved Searches", desc: "Get alerts for new leads", icon: Search },
    { href: "/dashboard/broker/profile", label: "My Profile", desc: "Agent details & areas served", icon: UserCircle },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Broker Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
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
