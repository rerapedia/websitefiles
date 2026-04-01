import { z } from "zod";

export const LeadFormSchema = z.object({
  buyerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  buyerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  buyerEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  budgetRange: z.enum(["UNDER_25L", "25L_50L", "50L_1CR", "1CR_2CR", "2CR_5CR", "ABOVE_5CR"]).optional(),
  message: z.string().max(500).optional(),
  projectId: z.string().uuid().optional(),
  builderId: z.string().uuid().optional(),
  sourceType: z.enum(["PROJECT_PAGE", "BUILDER_PAGE", "SEARCH_PAGE", "LEAD_MAGNET", "CONTACT_FORM"]),
  sourcePage: z.string().optional(),
});

export type LeadFormData = z.infer<typeof LeadFormSchema>;
