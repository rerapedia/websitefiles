import { prisma } from "./prisma";
import { toNum } from "@/lib/utils/format";

export async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findFirst({
    where: { slug, deletedAt: null },
    include: {
      state: true,
      builder: true,
      timeline: { orderBy: { detectedAt: "desc" }, take: 20 },
      faqs: { where: { entityType: "project" }, orderBy: { sortOrder: "asc" } },
      complaints: { orderBy: { filedDate: "desc" }, take: 10 },
    },
  });
  if (!project) return null;
  return {
    ...project,
    priceMinPaise: project.priceMinPaise != null ? Number(project.priceMinPaise) : null,
    priceMaxPaise: project.priceMaxPaise != null ? Number(project.priceMaxPaise) : null,
    trustScore: toNum(project.trustScore),
    completionPercentage: toNum(project.completionPercentage),
    carpetAreaMin: toNum(project.carpetAreaMin),
    carpetAreaMax: toNum(project.carpetAreaMax),
    lat: toNum(project.lat),
    lng: toNum(project.lng),
    state: project.state,
    builder: project.builder
      ? { ...project.builder, avgTrustScore: toNum(project.builder.avgTrustScore) }
      : null,
    timeline: project.timeline,
    faqs: project.faqs,
    complaints: project.complaints,
    trustScoreJson: project.trustScoreJson as Record<string, number> | null,
  };
}

export async function getBuilderBySlug(slug: string) {
  const builder = await prisma.builder.findFirst({
    where: { slug, deletedAt: null },
    include: {
      projects: {
        where: { deletedAt: null },
        include: { state: true },
        orderBy: { trustScore: "desc" },
      },
      faqs: { where: { entityType: "builder" }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!builder) return null;
  return {
    ...builder,
    avgTrustScore: toNum(builder.avgTrustScore),
    projects: builder.projects.map((p) => ({
      ...p,
      priceMinPaise: p.priceMinPaise != null ? Number(p.priceMinPaise) : null,
      priceMaxPaise: p.priceMaxPaise != null ? Number(p.priceMaxPaise) : null,
      trustScore: toNum(p.trustScore),
      completionPercentage: toNum(p.completionPercentage),
      carpetAreaMin: toNum(p.carpetAreaMin),
      carpetAreaMax: toNum(p.carpetAreaMax),
      lat: toNum(p.lat),
      lng: toNum(p.lng),
    })),
    faqs: builder.faqs,
  };
}

export async function getStats() {
  try {
    const [projectCount, builderCount, stateCount] = await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.builder.count({ where: { deletedAt: null } }),
      prisma.state.count({ where: { isActive: true } }),
    ]);
    return { projectCount, builderCount, stateCount };
  } catch (error) {
    console.error("getStats error:", error);
    return { projectCount: 0, builderCount: 0, stateCount: 0 };
  }
}

export async function getStates() {
  try {
    return await prisma.state.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getStates error:", error);
    return [];
  }
}

export async function getRecentProjects(limit = 6) {
  try {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    include: { state: true, builder: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return projects.map((p) => ({
    ...p,
    priceMinPaise: p.priceMinPaise != null ? Number(p.priceMinPaise) : null,
    priceMaxPaise: p.priceMaxPaise != null ? Number(p.priceMaxPaise) : null,
    trustScore: toNum(p.trustScore),
    completionPercentage: toNum(p.completionPercentage),
    carpetAreaMin: toNum(p.carpetAreaMin),
    carpetAreaMax: toNum(p.carpetAreaMax),
    lat: toNum(p.lat),
    lng: toNum(p.lng),
    state: p.state,
    builder: p.builder ? { ...p.builder, avgTrustScore: toNum(p.builder.avgTrustScore) } : null,
  }));
  } catch (error) {
    console.error("getRecentProjects error:", error);
    return [];
  }
}
