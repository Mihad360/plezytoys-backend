import { z } from "zod";

export const createReportSchema = z.object({
  body: z.object({
    type: z.enum(["incident", "maintenance", "general", "customer"]),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    location: z.string().optional(),
    customer: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
});

export const updateReportSchema = z.object({
  body: z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    assignedTo: z.string().optional(),
    resolutionNotes: z.string().optional(),
  })
});

export const ReportValidations = {
  createReportSchema,
  updateReportSchema,
};
