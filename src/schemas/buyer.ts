import { z } from "zod";

export const buyerCreateSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(1),
  propertyType: z.string().min(1),
  bhk: z.string().optional().or(z.literal("")),
  purpose: z.string().min(1),
  budgetMin: z.number().int().optional(),
  budgetMax: z.number().int().optional(),
  timeline: z.string().min(1),
  source: z.string().min(1),
  status: z.string().min(1).optional(),
  notes: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});


