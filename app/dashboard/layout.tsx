import Link from "next/link";
import { Heart, Building2, FileText, Settings, BarChart3, Users, Database, PenSquare, ShoppingCart, Search, UserCircle, Megaphone, ImageIcon, Briefcase, GitCompareArrows, Bell, FileDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/helpers";

const NAV_ITEMS: Record<string, Array<{ href: string; label: string; icon: React.ElementType }>> = {
  BUYER: [
    { href: "/dashboard/saved", label: "Saved Projects", icon: Heart },
    { href: "/dashboard/investor", label: "Investor Tools", icon: Briefcase },
  ],
  INVESTOR: [
    { href: "/dashboard/investor", label: "Overview", icon: BarChart3 },
    { href: "/dashboard/investor/portfolio", label: "My Portfolio", icon: Briefcase },
    { href: "/dashboard/investor/compare-builders", label: "Compare Builders", icon: GitCompareArrows },
    { href: "/dashboard/investor/compare-projects", label: "Compare Projects", icon: GitCompareArrows },
    { href: "/dashboard/investor/alerts", label: "Alert Settings", icon: Bell },
    { href: "/dashboard/investor/history", label: "Alert History", icon: Bell },
    { href: "/dashboard/investor/reports", label: "PDF Reports", icon: FileDown },
    { href: "/dashboard/saved", label: "Saved Projects", icon: Heart },
  ],
  BUILDER: [
    { href: "/dashboard/builder", label: "Overview", icon: BarChart3 },
    { href: "/dashboard/builder/projects", label: "My Projects", icon: Building2 },
    { href: "/dashboard/builder/leads", label: "Leads Inbox", icon: FileText },
    { href: "/dashboard/builder/campaigns", label: "Ad Campaigns", icon: Megaphone },
    { href: "/dashboard/builder/subscription", label: "Subscription", icon: ShoppingCart },
    { href: "/dashboard/builder/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/saved", label: "Saved Projects", icon: Heart },
  ],
  BROKER: [
    { href: "/dashboard/broker", label: "Overview", icon: BarChart3 },
    { href: "/dashboard/broker/leads", label: "Lead Marketplace", icon: ShoppingCart },
    { href: "/dashboard/broker/purchased", label: "My Leads", icon: FileText },
    { href: "/dashboard/broker/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/broker/market", label: "Market Intel", icon: Building2 },
    { href: "/dashboard/broker/searches", label: "Saved Searches", icon: Search },
    { href: "/dashboard/saved", label: "Saved Projects", icon: Heart },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Revenue", icon: BarChart3 },
    { href: "/dashboard/admin/leads", label: "All Leads", icon: FileText },
    { href: "/dashboard/admin/scrapers", label: "Scrapers", icon: Database },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/blog", label: "Blog", icon: PenSquare },
    { href: "/dashboard/admin/ads", label: "Ad Approvals", icon: ImageIcon },
    { href: "/dashboard/admin/claims", label: "Builder Claims", icon: Building2 },
    { href: "/dashboard/admin/email-marketing", label: "Email Campaigns", icon: FileText },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/saved", label: "Saved Projects", icon: Heart },
  ],
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const role = user?.role ?? "BUYER";
  const items = NAV_ITEMS[role] ?? NAV_ITEMS.BUYER;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
