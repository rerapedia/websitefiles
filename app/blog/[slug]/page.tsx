import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/format";
import { JsonLd, generateBreadcrumbJsonLd } from "@/lib/utils/seo";
import { AdNative } from "@/components/ads/ad-native";
import { BlogCard } from "@/components/blog/blog-card";
import { estimateReadingTime, getCategoryGradient, getCategoryColor } from "@/components/blog/reading-time";
import { Clock, User, ArrowLeft, Share2, ExternalLink } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
  });
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? `Read ${post.title} on ReraPedia Blog.`,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? "",
      type: "article",
      url: `/blog/${post.slug}`,
      ...(post.featuredImageUrl && { images: [post.featuredImageUrl] }),
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

function insertAdAfterParagraph(html: string, afterParagraph: number): string {
  const marker = "<!--AD_SLOT-->";
  let count = 0;
  return html.replace(/<\/p>/gi, (match) => {
    count++;
    if (count === afterParagraph) {
      return `${match}${marker}`;
    }
    return match;
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: { author: { select: { name: true } } },
  });
  if (!post) notFound();

  const readTime = estimateReadingTime(post.contentHtml);
  const gradient = getCategoryGradient(post.category);
  const catColor = getCategoryColor(post.category);

  // Related posts
  const related = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      slug: { not: post.slug },
      ...(post.category ? { category: post.category } : {}),
    },
    include: { author: { select: { name: true } } },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: { "@type": "Person", name: post.author.name ?? "ReraPedia Team" },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "ReraPedia",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    ...(post.featuredImageUrl && { image: post.featuredImageUrl }),
  };

  const contentWithAd = post.contentHtml
    ? insertAdAfterParagraph(post.contentHtml, 3)
    : "";
  const parts = contentWithAd.split("<!--AD_SLOT-->");

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerapedia.com"}/blog/${post.slug}`;

  return (
    <>
      <JsonLd data={[generateBreadcrumbJsonLd(breadcrumbs), articleJsonLd]} />

      {/* Hero Banner */}
      <div className={`relative bg-gradient-to-br ${gradient}`}>
        {post.featuredImageUrl && (
          <img src={post.featuredImageUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-20 md:pb-16 md:pt-28">
          {/* Back to blog */}
          <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
          </Link>

          {post.category && (
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${catColor}`}>
              {post.category}
            </span>
          )}

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                {(post.author.name ?? "G")[0].toUpperCase()}
              </div>
              {post.author.name ?? "ReraPedia Team"}
            </span>
            <span>{formatDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readTime} min read
            </span>
            {post.language === "hi" && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">हिंदी</span>
            )}
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="mx-auto max-w-3xl px-4 py-10">
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-primary prose-strong:text-gray-900 prose-blockquote:border-brand-primary prose-blockquote:text-gray-600">
          {parts.map((part, i) => (
            <div key={i}>
              <div dangerouslySetInnerHTML={{ __html: part }} />
              {i < parts.length - 1 && <AdNative />}
            </div>
          ))}
        </div>

        {/* Tags */}
        {post.tags && (post.tags as string[]).length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {(post.tags as string[]).map((tag) => (
              <span key={tag} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share bar */}
        <div className="mt-8 flex items-center gap-3 border-t border-gray-100 pt-6">
          <span className="text-sm font-medium text-gray-500">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={undefined}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-primary"
            title="Copy link"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Author card */}
        <div className="mt-8 flex items-center gap-4 rounded-2xl bg-gray-50 p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-light text-xl font-bold text-white">
            {(post.author.name ?? "G")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author.name ?? "ReraPedia Team"}</p>
            <p className="mt-0.5 text-sm text-gray-600">
              Real estate and RERA compliance expert. Writing about property transparency and home buying in India.
            </p>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12 border-t border-gray-100 pt-10">
            <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <BlogCard
                  key={r.id}
                  post={{
                    id: r.id,
                    title: r.title,
                    slug: r.slug,
                    seoDescription: r.seoDescription,
                    contentHtml: r.contentHtml,
                    category: r.category,
                    language: r.language,
                    featuredImageUrl: r.featuredImageUrl,
                    publishedAt: r.publishedAt,
                    author: { name: r.author.name },
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
