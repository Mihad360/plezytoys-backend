import { z } from "zod";

export const createSupportTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(1, "Subject is required"),
    description: z.string().min(1, "Description is required"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  })
});

export const updateSupportTicketSchema = z.object({
  body: z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    assignedToAdmin: z.string().optional(),
  })
});

export const SupportTicketValidations = {
  createSupportTicketSchema,
  updateSupportTicketSchema,
};
