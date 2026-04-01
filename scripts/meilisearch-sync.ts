/**
 * Sync PostgreSQL data to Meilisearch indexes.
 * Run: npm run search:sync
 *
 * Creates/updates three indexes:
 * - gs_projects: searchable by name, builder, city, locality, RERA number
 * - gs_builders: searchable by name
 * - gs_localities: searchable by name, city
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { MeiliSearch } from "meilisearch";

function getDbUrl(): string {
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("?schema=") ? url.split("?schema=")[0] : url;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDbUrl() }),
});

const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY ?? "",
});

function toNumber(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "number") return val;
  if (typeof val === "object" && val !== null && "toNumber" in val) {
    return (val as { toNumber(): number }).toNumber();
  }
  const n = Number(val);
  return isNaN(n) ? null : n;
}

async function syncProjects() {
  console.log("Syncing projects...");
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    include: { state: true, builder: true },
  });

  const documents = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    reraRegNumber: p.reraRegNumber,
    stateSlug: p.state.slug,
    stateName: p.state.name,
    builderName: p.builder?.name ?? null,
    builderSlug: p.builder?.slug ?? null,
    city: p.city,
    locality: p.locality,
    district: p.district,
    status: p.status,
    type: p.type,
    trustScore: toNumber(p.trustScore),
    completionPercentage: toNumber(p.completionPercentage),
    priceMinPaise: toNumber(p.priceMinPaise),
    priceMaxPaise: toNumber(p.priceMaxPaise),
    totalUnits: p.totalUnits,
    createdAt: p.createdAt.toISOString(),
  }));

  const index = meilisearch.index("gs_projects");
  await index.addDocuments(documents, { primaryKey: "id" });
  await index.updateFilterableAttributes([
    "stateSlug", "city", "status", "type", "trustScore", "builderSlug",
  ]);
  await index.updateSearchableAttributes([
    "name", "builderName", "city", "locality", "reraRegNumber", "district",
  ]);
  await index.updateSortableAttributes(["trustScore", "createdAt", "name"]);
  await index.updatePagination({ maxTotalHits: 5000 });

  console.log(`  Synced ${documents.length} projects`);
}

async function syncBuilders() {
  console.log("Syncing builders...");
  const builders = await prisma.builder.findMany({
    where: { deletedAt: null },
  });

  const documents = builders.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    totalProjects: b.totalProjects,
    avgTrustScore: toNumber(b.avgTrustScore),
    isClaimed: b.isClaimed,
  }));

  const index = meilisearch.index("gs_builders");
  await index.addDocuments(documents, { primaryKey: "id" });
  await index.updateSearchableAttributes(["name"]);
  await index.updateFilterableAttributes(["isClaimed", "avgTrustScore"]);
  await index.updateSortableAttributes(["avgTrustScore", "totalProjects", "name"]);

  console.log(`  Synced ${documents.length} builders`);
}

async function syncLocalities() {
  console.log("Syncing localities...");
  const localities = await prisma.locality.findMany({
    include: { state: true },
  });

  const documents = localities.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    city: l.city,
    stateSlug: l.state.slug,
    stateName: l.state.name,
    totalProjects: l.totalProjects,
    avgPriceSqftPaise: l.avgPriceSqftPaise,
  }));

  const index = meilisearch.index("gs_localities");
  await index.addDocuments(documents, { primaryKey: "id" });
  await index.updateSearchableAttributes(["name", "city"]);
  await index.updateFilterableAttributes(["stateSlug", "city"]);
  await index.updateSortableAttributes(["totalProjects", "name"]);

  console.log(`  Synced ${documents.length} localities`);
}

async function main() {
  console.log("Starting Meilisearch sync...\n");

  try {
    const health = await meilisearch.health();
    console.log(`Meilisearch status: ${health.status}\n`);
  } catch (e) {
    console.error("Cannot connect to Meilisearch at", process.env.MEILISEARCH_HOST);
    console.error("Make sure Meilisearch is running (brew services start meilisearch)");
    process.exit(1);
  }

  await syncProjects();
  await syncBuilders();
  await syncLocalities();

  console.log("\nSync complete!");
}

main()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
