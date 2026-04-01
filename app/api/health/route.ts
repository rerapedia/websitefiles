import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: (process.env.DATABASE_URL ?? "").substring(0, 40) + "...",
      DIRECT_URL_SET: !!process.env.DIRECT_URL,
      DIRECT_URL_PREFIX: (process.env.DIRECT_URL ?? "").substring(0, 40) + "...",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  // Test database connection
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const stateCount = await prisma.state.count();
    const projectCount = await prisma.project.count();
    const builderCount = await prisma.builder.count();
    const blogCount = await prisma.blogPost.count();

    diagnostics.database = {
      connected: true,
      states: stateCount,
      projects: projectCount,
      builders: builderCount,
      blogPosts: blogCount,
    };
  } catch (error) {
    diagnostics.database = {
      connected: false,
      error: String(error),
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  return NextResponse.json(diagnostics);
}
