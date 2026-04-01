import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatPaise, formatDate } from "@/lib/utils/format";
import { CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Subscription Management" };

export default async function BuilderSubscriptionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>

      {/* Current plan */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
        </div>
        {subscription ? (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-brand-primary">{subscription.plan.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                subscription.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                subscription.status === "PAST_DUE" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {subscription.status === "ACTIVE" ? <><CheckCircle className="mr-1 inline h-3 w-3" />Active</> :
                 subscription.status === "PAST_DUE" ? <><AlertTriangle className="mr-1 inline h-3 w-3" />Past Due</> :
                 subscription.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {formatPaise(subscription.plan.priceMonthlyPaise)}/month
            </p>
            {subscription.currentPeriodEnd && (
              <p className="text-sm text-gray-500">
                Next billing: {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <Link href="/pricing" className="rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-5 py-2 text-sm font-medium text-white shadow-sm">
                Upgrade Plan
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-gray-600">You are on the <span className="font-semibold">Free Plan</span></p>
            <p className="mt-1 text-sm text-gray-500">Upgrade to unlock leads, analytics, and advertising features.</p>
            <Link href="/pricing" className="mt-4 inline-block rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-5 py-2.5 text-sm font-semibold text-white shadow-md">
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
        {invoices.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Invoice #</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">GST</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="px-3 py-2">{formatPaise(inv.amountPaise)}</td>
                    <td className="px-3 py-2 text-gray-500">{formatPaise(inv.taxGstPaise)}</td>
                    <td className="px-3 py-2 font-medium">{formatPaise(inv.totalPaise)}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${inv.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">{formatDate(inv.issuedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No invoices yet.</p>
        )}
      </div>
    </div>
  );
}
