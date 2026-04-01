import { MeiliSearch } from "meilisearch";

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_API_KEY ?? "",
});

export const INDEXES = {
  PROJECTS: "gs_projects",
  BUILDERS: "gs_builders",
  LOCALITIES: "gs_localities",
} as const;
