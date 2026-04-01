import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["BUYER", "BUILDER", "BROKER"]).default("BUYER"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number").optional().or(z.literal("")),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});

export const PhoneOtpRequestSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number required"),
});

export const PhoneOtpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export const GstinSchema = z.object({
  gstin: z.string().regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Invalid GSTIN format",
  ),
  builderSlug: z.string().min(1),
});

export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
