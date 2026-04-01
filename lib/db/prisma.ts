import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function getDbUrl(): string {
  // Try DIRECT_URL first, then DATABASE_URL
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  // Strip Prisma-specific ?schema= param that pg doesn't understand
  if (url.includes("?schema=")) return url.split("?schema=")[0];
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const dbUrl = getDbUrl();
  console.log(`[Prisma] Connecting to: ${dbUrl.replace(/:[^@]+@/, ':****@')}`);
  try {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: dbUrl }),
    });
  } catch (error) {
    console.error("[Prisma] Failed to create client:", error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
