import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { BlogEditor } from "../blog-editor";

export const metadata: Metadata = { title: "New Blog Post" };

export default async function NewBlogPostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">New Blog Post</h1>
      <div className="mt-6">
        <BlogEditor />
      </div>
    </div>
  );
}
