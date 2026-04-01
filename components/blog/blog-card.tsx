import Link from "next/link";
import { Clock, User } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { estimateReadingTime, getCategoryGradient, getCategoryColor } from "./reading-time";

export interface BlogCardPost {
  id: string;
  title: string;
  slug: string;
  seoDescription: string | null;
  contentHtml: string | null;
  category: string | null;
  language: string;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  author: { name: string | null };
}

export function BlogCard({ post, featured = false }: { post: BlogCardPost; featured?: boolean }) {
  const readTime = estimateReadingTime(post.contentHtml);
  const gradient = getCategoryGradient(post.category);
  const catColor = getCategoryColor(post.category);

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.08)]">
          {/* Image / Gradient */}
          <div className={`relative h-72 bg-gradient-to-br ${gradient} md:h-96`}>
            {post.featuredImageUrl && (
              <img src={post.featuredImageUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
            )}
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              {post.category && (
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${catColor}`}>
                  {post.category}
                </span>
              )}
              <h2 className="mt-3 text-2xl font-extrabold text-white transition-colors group-hover:text-blue-200 md:text-4xl">
                {post.title}
              </h2>
              {post.seoDescription && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-200 md:text-base">
                  {post.seoDescription}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {post.author.name ?? "ReraPedia Team"}
                </span>
                <span>{formatDate(post.publishedAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_12px_28px_rgba(0,0,0,0.08)]">
        {/* Image / Gradient placeholder */}
        <div className={`relative h-44 bg-gradient-to-br ${gradient}`}>
          {post.featuredImageUrl && (
            <img src={post.featuredImageUrl} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          )}
          {post.category && (
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColor}`}>
              {post.category}
            </span>
          )}
          {post.language === "hi" && (
            <span className="absolute right-3 top-3 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
              हिंदी
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-brand-primary">
            {post.title}
          </h3>
          {post.seoDescription && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {post.seoDescription}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-primary">
                  {(post.author.name ?? "G")[0].toUpperCase()}
                </div>
                {post.author.name ?? "ReraPedia"}
              </span>
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
