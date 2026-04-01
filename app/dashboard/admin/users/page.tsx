import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin: Users" };

type Props = {
  searchParams: Promise<{ role?: string; page?: string }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const limit = 50;
  const where: Record<string, unknown> = { deletedAt: null };
  if (params.role) where.role = params.role;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      <p className="mt-1 text-sm text-gray-600">{total} users</p>

      <form className="mt-4 flex gap-3">
        <select name="role" defaultValue={params.role ?? ""} className="rounded border border-gray-300 px-3 py-1.5 text-sm">
          <option value="">All Roles</option>
          {["PUBLIC", "BUYER", "BUILDER", "BROKER", "ADMIN"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-brand-primary px-4 py-1.5 text-sm text-white hover:bg-blue-700">Filter</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Subscription</th>
              <th className="px-3 py-3">Verified</th>
              <th className="px-3 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3 font-medium">{u.name ?? "—"}</td>
                <td className="px-3 py-3 text-gray-600">{u.email ?? u.phone ?? "—"}</td>
                <td className="px-3 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium">{u.role}</span>
                </td>
                <td className="px-3 py-3 text-xs text-gray-600">
                  {u.subscriptions[0]?.plan.name ?? "Free"}
                </td>
                <td className="px-3 py-3">
                  {u.isVerified ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
