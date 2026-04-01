import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { z } from "zod";

const BlogPostSchema = z.object({
  title: z.string().min(3).max(300),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  contentHtml: z.string().min(10),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  language: z.enum(["en", "hi"]).default("en"),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const status = request.nextUrl.searchParams.get("status");
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;

    const posts = await prisma.blogPost.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: { posts } });
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = BlogPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
        { status: 400 },
      );
    }

    const { title, slug, contentHtml, category, tags, language, seoTitle, seoDescription, featuredImageUrl, status } = parsed.data;

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        contentHtml,
        authorId: user.id,
        category: category || null,
        tags: tags ?? [],
        language,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        featuredImageUrl: featuredImageUrl || null,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: { id: post.id, slug: post.slug } });
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Post ID required" }, { status: 400 });
    }

    const parsed = BlogPostSchema.partial().safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    const data = parsed.data;
    if (data.status === "PUBLISHED") {
      (data as Record<string, unknown>).publishedAt = new Date();
    }

    await prisma.blogPost.update({ where: { id }, data });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
