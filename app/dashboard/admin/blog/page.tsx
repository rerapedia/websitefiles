import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Admin: Blog" };

export default async function AdminBlogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const posts = await prisma.blogPost.findMany({
    where: { deletedAt: null },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    REVIEW: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Link
          href="/dashboard/admin/blog/new"
          className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-brand-primary to-brand-light px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Language</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Published</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-3">
                  <Link href={`/dashboard/admin/blog/edit/${post.id}`} className="font-medium text-brand-primary hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-500">/blog/{post.slug}</p>
                </td>
                <td className="px-3 py-3 text-xs uppercase">{post.language}</td>
                <td className="px-3 py-3 text-gray-600">{post.category ?? "—"}</td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[post.status] ?? ""}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                  No blog posts yet. Create your first post!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
