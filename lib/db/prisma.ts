import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function getDbUrl(): string {
  // Use DIRECT_URL for direct connection (no pooler)
  // Fall back to DATABASE_URL
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  // Strip Prisma-specific ?schema= param that pg doesn't understand
  if (url.includes("?schema=")) return url.split("?schema=")[0];
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDbUrl() }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
