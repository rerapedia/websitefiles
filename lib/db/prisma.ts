// Disable TLS certificate verification for Supabase connection
// Must be set BEFORE any database connection is created
if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

function getDbUrl(): string {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  if (url.includes("?schema=")) return url.split("?schema=")[0];
  return url;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const dbUrl = getDbUrl();

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

  return new PrismaClient({
    adapter: new PrismaPg(pool),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
