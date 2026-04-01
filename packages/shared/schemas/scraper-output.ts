/**
 * Zod validation schemas for scraper output.
 *
 * These mirror the Pydantic models in packages/scrapers/pipelines/validation.py.
 * Used to validate data before database insert on the TypeScript side.
 */

import { z } from "zod";

// ============================================================================
// Enums (match Prisma schema enums)
// ============================================================================

export const ProjectStatusEnum = z.enum([
  "REGISTERED",
  "UNDER_CONSTRUCTION",
  "COMPLETED",
  "LAPSED",
  "REVOKED",
  "EXTENDED",
]);

export const ProjectTypeEnum = z.enum([
  "RESIDENTIAL",
  "COMMERCIAL",
  "MIXED",
  "PLOTTED",
  "TOWNSHIP",
]);

// ============================================================================
// Haryana RERA Scraper Output Schema
// ============================================================================

export const HaryanaReraProjectSchema = z.object({
  // Required identifiers
  rera_project_id: z
    .string()
    .min(5, "RERA project ID must be at least 5 characters")
    .transform((v) => v.trim().toUpperCase()),

  registration_number: z
    .string()
    .default(""),

  internal_id: z
    .string()
    .optional()
    .nullable(),

  // Required project info
  project_name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(500, "Project name exceeds 500 characters")
    .transform((v) => v.trim()),

  project_type: ProjectTypeEnum,

  promoter_name: z
    .string()
    .min(2, "Promoter name must be at least 2 characters")
    .transform((v) => v.trim()),

  // Required location
  project_address: z
    .string()
    .default(""),

  district: z
    .string()
    .min(1, "District cannot be empty")
    .transform((v) => v.trim().toUpperCase()),

  // Optional fields
  tehsil: z.string().optional().nullable(),
  registration_date: z.string().optional().nullable(),
  registration_upto: z.string().optional().nullable(),
  registered_with: z.string().optional().nullable(),
  status: ProjectStatusEnum,
  receiving_date: z.string().optional().nullable(),
  approval_status: z.string().optional().nullable(),
  certificate_uploaded: z.string().optional().nullable(),

  // Metadata
  source_url: z.string().url().optional().nullable(),
  detail_url: z.string().url().optional().nullable(),
  scraped_at: z.string().datetime().optional().nullable(),
});

export type HaryanaReraProject = z.infer<typeof HaryanaReraProjectSchema>;

// ============================================================================
// Batch validation helper
// ============================================================================

export const HaryanaReraProjectBatchSchema = z.array(HaryanaReraProjectSchema);

/**
 * Validate a single scraper output item.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateScraperOutput(data: unknown): {
  success: boolean;
  data?: HaryanaReraProject;
  error?: string;
} {
  const result = HaryanaReraProjectSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
  };
}

/**
 * Validate a batch of scraper output items.
 * Returns valid items and a list of errors for invalid ones.
 */
export function validateScraperBatch(items: unknown[]): {
  valid: HaryanaReraProject[];
  errors: Array<{ index: number; error: string; item: unknown }>;
} {
  const valid: HaryanaReraProject[] = [];
  const errors: Array<{ index: number; error: string; item: unknown }> = [];

  items.forEach((item, index) => {
    const result = HaryanaReraProjectSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        index,
        error: result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
        item,
      });
    }
  });

  return { valid, errors };
}
