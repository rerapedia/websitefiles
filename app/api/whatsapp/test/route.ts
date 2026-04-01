import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rerapedia.com";

/**
 * WhatsApp Bot Test Endpoint — same logic as webhook but returns JSON.
 * Usage: GET /api/whatsapp/test?q=RERA-GRG-741-2020
 *        GET /api/whatsapp/test?q=DLF
 *        GET /api/whatsapp/test?q=search Gurugram
 *        GET /api/whatsapp/test?q=help
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      success: true,
      message: "Send ?q=RERA_NUMBER or ?q=BUILDER_NAME or ?q=search CITY or ?q=help",
    });
  }

  const lower = query.toLowerCase();

  // Help
  if (lower === "help" || lower === "hi" || lower === "hello") {
    return NextResponse.json({
      success: true,
      type: "help",
      message: "Send a RERA number, builder name, or 'search [city]'",
    });
  }

  // City search
  if (lower.startsWith("search ")) {
    const city = query.slice(7).trim();
    const projects = await prisma.project.findMany({
      where: { city: { contains: city, mode: "insensitive" }, deletedAt: null, trustScore: { not: null } },
      include: { builder: { select: { name: true } }, state: { select: { slug: true } } },
      orderBy: { trustScore: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      type: "city_search",
      city,
      count: projects.length,
      projects: projects.map((p) => ({
        name: p.name,
        builder: p.builder?.name,
        trustScore: Number(p.trustScore),
        status: p.status,
        url: `${BASE_URL}/project/${p.state.slug}/${p.slug}`,
      })),
    });
  }

  // RERA number lookup
  if (/rera/i.test(query) || /^[A-Z]{2,}[-\/]\d/i.test(query) || /^\d{2,}\/\d+/i.test(query) || /^P\d{5,}/.test(query) || /^PRM\//i.test(query)) {
    const project = await prisma.project.findFirst({
      where: { reraRegNumber: { contains: query, mode: "insensitive" }, deletedAt: null },
      include: { builder: { select: { name: true } }, state: { select: { slug: true } } },
    });

    if (project) {
      return NextResponse.json({
        success: true,
        type: "rera_lookup",
        project: {
          name: project.name,
          rera: project.reraRegNumber,
          builder: project.builder?.name,
          city: project.city,
          trustScore: Number(project.trustScore),
          status: project.status,
          url: `${BASE_URL}/project/${project.state.slug}/${project.slug}`,
        },
      });
    }
    return NextResponse.json({ success: true, type: "rera_lookup", project: null, message: "No project found" });
  }

  // Builder search
  const builders = await prisma.builder.findMany({
    where: { name: { contains: query, mode: "insensitive" }, deletedAt: null },
    include: { _count: { select: { projects: true } } },
    take: 3,
  });

  if (builders.length > 0) {
    return NextResponse.json({
      success: true,
      type: "builder_search",
      builders: builders.map((b) => ({
        name: b.name,
        avgTrustScore: Number(b.avgTrustScore),
        totalProjects: b._count.projects,
        url: `${BASE_URL}/builder/${b.slug}`,
      })),
    });
  }

  // Fallback — try as project name
  const project = await prisma.project.findFirst({
    where: { name: { contains: query, mode: "insensitive" }, deletedAt: null },
    include: { builder: { select: { name: true } }, state: { select: { slug: true } } },
  });

  if (project) {
    return NextResponse.json({
      success: true,
      type: "project_search",
      project: {
        name: project.name,
        rera: project.reraRegNumber,
        builder: project.builder?.name,
        trustScore: Number(project.trustScore),
        url: `${BASE_URL}/project/${project.state.slug}/${project.slug}`,
      },
    });
  }

  return NextResponse.json({ success: true, type: "no_results", message: `Nothing found for "${query}"` });
}
