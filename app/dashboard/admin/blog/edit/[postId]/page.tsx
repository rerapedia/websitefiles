import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db/prisma";
import { BlogEditor } from "../../blog-editor";

export const metadata: Metadata = { title: "Edit Blog Post" };

type Props = { params: Promise<{ postId: string }> };

export default async function EditBlogPostPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/dashboard/saved");

  const { postId } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Edit: {post.title}</h1>
      <div className="mt-6">
        <BlogEditor
          postId={post.id}
          initialTitle={post.title}
          initialSlug={post.slug}
          initialContent={post.contentHtml ?? ""}
          initialCategory={post.category ?? ""}
          initialTags={(post.tags as string[]) ?? []}
          initialLanguage={post.language}
          initialSeoTitle={post.seoTitle ?? ""}
          initialSeoDescription={post.seoDescription ?? ""}
          initialFeaturedImage={post.featuredImageUrl ?? ""}
          initialStatus={post.status}
        />
      </div>
    </div>
  );
}
