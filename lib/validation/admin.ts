import { z } from "zod";

export const LeadQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST", "SPAM"]).optional(),
  sourceType: z.enum(["PROJECT_PAGE", "BUILDER_PAGE", "LOCALITY_PAGE", "SEARCH_PAGE", "BLOG_POST", "COMPARISON_PAGE", "WHATSAPP"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});
