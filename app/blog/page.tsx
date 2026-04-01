import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogListingClient } from "./blog-listing-client";
import { BookOpen, Pen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog - RERA Guides, News & Analysis | ReraPedia",
  description: "RERA news, home buying guides, builder reviews, and real estate investment tips across India. Expert analysis for Haryana, Delhi, UP, Maharashtra & Karnataka.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ReraPedia Blog - RERA Guides, News & Analysis",
    description: "RERA news, home buying guides, builder reviews, and real estate investment tips across India.",
    url: "/blog",
    type: "website",
  },
};

export default async function BlogListingPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  // Extract unique categories
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))] as string[];

  // Separate featured (latest) from rest
  const featured = posts[0] ?? null;
  const rest = posts.slice(1);

  // Collect all tags for tag cloud
  const allTags = new Map<string, number>();
  for (const post of posts) {
    const tags = post.tags as string[] | null;
    if (tags) {
      for (const tag of tags) {
        allTags.set(tag, (allTags.get(tag) ?? 0) + 1);
      }
    }
  }
  const topTags = [...allTags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-light shadow-lg">
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 md:text-4xl">ReraPedia Blog</h1>
        <p className="mt-2 text-lg text-gray-600">
          RERA guides, builder analysis, and real estate insights for smart property decisions
        </p>
      </div>

      {/* Featured post hero */}
      {featured && (
        <div className="mt-10">
          <BlogCard
            post={{
              id: featured.id,
              title: featured.title,
              slug: featured.slug,
              seoDescription: featured.seoDescription,
              contentHtml: featured.contentHtml,
              category: featured.category,
              language: featured.language,
              featuredImageUrl: featured.featuredImageUrl,
              publishedAt: featured.publishedAt,
              author: { name: featured.author.name },
            }}
            featured
          />
        </div>
      )}

      {/* Category filters + Grid — Client component for interactivity */}
      <BlogListingClient
        posts={rest.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          seoDescription: p.seoDescription,
          contentHtml: p.contentHtml,
          category: p.category,
          language: p.language,
          featuredImageUrl: p.featuredImageUrl,
          publishedAt: p.publishedAt,
          author: { name: p.author.name },
        }))}
        categories={categories}
      />

      {/* Bottom section: Tags + Newsletter CTA */}
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        {/* Popular Tags */}
        {topTags.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)]">
            <h2 className="text-lg font-bold text-gray-900">Popular Topics</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-primary"
                >
                  {tag} <span className="ml-1 text-xs text-gray-400">({count})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Write for Us CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-primary to-brand-light p-6 text-white shadow-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Pen className="h-5 w-5 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-bold">Write for ReraPedia</h2>
          <p className="mt-2 text-sm text-blue-100">
            Are you a real estate expert? Share your insights with thousands of home buyers.
            We publish RERA guides, market analysis, and builder reviews.
          </p>
          <a
            href="mailto:editorial@rerapedia.com"
            className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-primary shadow-sm transition-all hover:shadow-md"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {posts.length === 0 && (
        <p className="py-20 text-center text-gray-500">No articles yet. Check back soon!</p>
      )}
    </div>
  );
}
