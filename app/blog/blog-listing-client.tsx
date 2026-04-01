"use client";

import { useState } from "react";
import { BlogCard, type BlogCardPost } from "@/components/blog/blog-card";
import { CategoryFilter } from "@/components/blog/category-filter";

export function BlogListingClient({
  posts,
  categories,
}: {
  posts: BlogCardPost[];
  categories: string[];
}) {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? posts.filter((p) => p.category === filter) : posts;

  return (
    <>
      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="mt-10">
          <CategoryFilter categories={categories} onFilter={setFilter} />
        </div>
      )}

      {/* Post grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          No articles in this category yet.
        </p>
      )}
    </>
  );
}
