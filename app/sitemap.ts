import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerapedia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
  const [projects, builders, states, localities, blogPosts] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true, state: { select: { slug: true } } },
    }),
    prisma.builder.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.state.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.locality.findMany({
      select: { slug: true, city: true, updatedAt: true, state: { select: { slug: true } } },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Generate city-level locality URLs from project data
  const cityUrls = new Map<string, Date>();
  for (const p of projects) {
    if (!p.slug) continue;
    const stateSlug = p.state.slug;
    // We don't have city slug directly, but state pages list cities
  }

  // Generate comparison page URLs for top builders
  const topBuilders = builders
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 50);

  const comparisonPages: MetadataRoute.Sitemap = [];
  for (let i = 0; i < Math.min(topBuilders.length, 20); i++) {
    for (let j = i + 1; j < Math.min(topBuilders.length, 20); j++) {
      comparisonPages.push({
        url: `${SITE_URL}/compare/builders/${topBuilders[i].slug}-vs-${topBuilders[j].slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
      if (comparisonPages.length >= 100) break; // Cap at 100 comparison pages
    }
    if (comparisonPages.length >= 100) break;
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/project/${p.state.slug}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const builderPages: MetadataRoute.Sitemap = builders.map((b) => ({
    url: `${SITE_URL}/builder/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const statePages: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${SITE_URL}/state/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const localityPages: MetadataRoute.Sitemap = localities.map((l) => ({
    url: `${SITE_URL}/locality/${l.state.slug}/${l.city.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: l.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const allPages = [
    ...staticPages,
    ...statePages,
    ...projectPages,
    ...builderPages,
    ...localityPages,
    ...blogPages,
    ...comparisonPages,
  ];

  console.log(`[Sitemap] Generated ${allPages.length} URLs (${projectPages.length} projects, ${builderPages.length} builders, ${blogPages.length} blog, ${comparisonPages.length} comparisons)`);

  return allPages;

  } catch (error) {
    // Database not available during build (e.g., first Vercel deploy)
    console.log("[Sitemap] Database not available, returning static pages only");
    return [
      { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
      { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ];
  }
}
