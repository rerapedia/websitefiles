import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://rerapedia.com";

/**
 * WhatsApp Bot Webhook — Twilio WhatsApp Business API
 *
 * User sends a RERA number → returns project trust score and details
 * User sends a builder name → returns builder avg score and project count
 * User sends "help" → returns usage instructions
 *
 * Twilio sandbox: https://www.twilio.com/console/sms/whatsapp/sandbox
 * Set webhook URL to: https://yourdomain.com/api/whatsapp/webhook
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = formData.get("Body")?.toString().trim() ?? "";
    const from = formData.get("From")?.toString() ?? "";

    if (!body) {
      return createTwimlResponse("Please send a RERA number, builder name, or 'help' for instructions.");
    }

    const lowerBody = body.toLowerCase();

    // Help command
    if (lowerBody === "help" || lowerBody === "hi" || lowerBody === "hello") {
      return createTwimlResponse(
        `Welcome to ReraPedia! 🏠\n\n` +
        `Send me:\n` +
        `• A *RERA number* (e.g., RERA-GRG-741-2020) to check a project's trust score\n` +
        `• A *builder name* (e.g., DLF) to see their track record\n` +
        `• *search [city]* to see top projects in a city\n\n` +
        `Visit ${BASE_URL} for detailed analysis.`
      );
    }

    // Search command
    if (lowerBody.startsWith("search ")) {
      const city = body.slice(7).trim();
      return await handleCitySearch(city);
    }

    // Try RERA number lookup first (matches patterns like RERA-xxx, DLRERA, etc.)
    if (
      /rera/i.test(body) ||
      /^[A-Z]{2,}[-\/]\d/i.test(body) ||
      /^\d{2,}\/\d+/i.test(body)
    ) {
      return await handleReraLookup(body);
    }

    // Try builder name search
    return await handleBuilderSearch(body);
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return createTwimlResponse("Sorry, something went wrong. Please try again.");
  }
}

// Twilio verification for sandbox setup
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "WhatsApp webhook active" });
}

async function handleReraLookup(reraNumber: string): Promise<NextResponse> {
  const project = await prisma.project.findFirst({
    where: {
      reraRegNumber: { contains: reraNumber, mode: "insensitive" },
      deletedAt: null,
    },
    include: {
      builder: { select: { name: true } },
      state: { select: { name: true, slug: true } },
    },
  });

  if (!project) {
    return createTwimlResponse(
      `No project found for RERA number "${reraNumber}".\n\n` +
      `Try the full RERA number or search by builder name.\n` +
      `Visit ${BASE_URL}/search to browse all projects.`
    );
  }

  const score = Number(project.trustScore ?? 0);
  const scoreLabel = getScoreLabel(score);
  const projectUrl = `${BASE_URL}/project/${project.state?.slug}/${project.slug}`;

  return createTwimlResponse(
    `🏗️ *${project.name}*\n\n` +
    `📊 Trust Score: *${score}/100* (${scoreLabel})\n` +
    `🏢 Builder: ${project.builder?.name ?? "Unknown"}\n` +
    `📍 Location: ${project.locality ?? project.city ?? "N/A"}\n` +
    `📋 RERA: ${project.reraRegNumber}\n` +
    `📌 Status: ${project.status.replace(/_/g, " ")}\n\n` +
    `🔗 Full details: ${projectUrl}`
  );
}

async function handleBuilderSearch(name: string): Promise<NextResponse> {
  const builders = await prisma.builder.findMany({
    where: {
      name: { contains: name, mode: "insensitive" },
      deletedAt: null,
    },
    include: {
      _count: { select: { projects: true } },
    },
    take: 3,
  });

  if (builders.length === 0) {
    // Fallback: try as project name search
    const project = await prisma.project.findFirst({
      where: {
        name: { contains: name, mode: "insensitive" },
        deletedAt: null,
      },
      include: {
        builder: { select: { name: true } },
        state: { select: { slug: true } },
      },
    });

    if (project) {
      const score = Number(project.trustScore ?? 0);
      const projectUrl = `${BASE_URL}/project/${project.state?.slug}/${project.slug}`;
      return createTwimlResponse(
        `🏗️ *${project.name}*\n` +
        `📊 Trust Score: *${score}/100* (${getScoreLabel(score)})\n` +
        `🏢 Builder: ${project.builder?.name ?? "Unknown"}\n` +
        `📌 Status: ${project.status.replace(/_/g, " ")}\n\n` +
        `🔗 ${projectUrl}`
      );
    }

    return createTwimlResponse(
      `No builder or project found for "${name}".\n\n` +
      `Try:\n• A RERA registration number\n• A builder company name\n• "search Gurugram" for city projects\n\n` +
      `Visit ${BASE_URL}/search for full search.`
    );
  }

  let response = "";
  for (const b of builders) {
    const avgScore = Number(b.avgTrustScore ?? 0);
    const builderUrl = `${BASE_URL}/builder/${b.slug}`;
    response +=
      `🏢 *${b.name}*\n` +
      `📊 Avg Score: ${avgScore > 0 ? `${avgScore}/100 (${getScoreLabel(avgScore)})` : "Not yet scored"}\n` +
      `🏗️ Projects: ${b._count.projects}\n` +
      `🔗 ${builderUrl}\n\n`;
  }

  return createTwimlResponse(response.trim());
}

async function handleCitySearch(city: string): Promise<NextResponse> {
  const projects = await prisma.project.findMany({
    where: {
      city: { contains: city, mode: "insensitive" },
      deletedAt: null,
      trustScore: { not: null },
    },
    include: {
      builder: { select: { name: true } },
      state: { select: { slug: true } },
    },
    orderBy: { trustScore: "desc" },
    take: 5,
  });

  if (projects.length === 0) {
    return createTwimlResponse(
      `No projects found in "${city}".\n\n` +
      `Try: Gurugram, New Delhi, Gurgaon\n` +
      `Visit ${BASE_URL}/search for full search.`
    );
  }

  let response = `🏙️ *Top Projects in ${city}*\n\n`;
  for (const p of projects) {
    const score = Number(p.trustScore ?? 0);
    response += `• *${p.name}* — ${score}/100\n  ${p.builder?.name ?? ""}\n`;
  }
  response += `\n🔗 ${BASE_URL}/search?q=${encodeURIComponent(city)}`;

  return createTwimlResponse(response);
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent ✅";
  if (score >= 60) return "Reliable 👍";
  if (score >= 45) return "Average ⚠️";
  if (score >= 30) return "Concerning ⚠️";
  return "High Risk ❌";
}

function createTwimlResponse(message: string): NextResponse {
  // Twilio expects TwiML XML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
