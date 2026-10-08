import { z } from "zod";

export const createReportTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Template name is required"),
    description: z.string().optional(),
    type: z.enum(["duty_report", "round_report", "incident_report", "custom_report"]),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(["text", "number", "boolean", "date", "dropdown"]),
      options: z.array(z.string()).optional(),
      required: z.boolean().optional(),
    })).optional(),
  })
});

export const updateReportTemplateSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(["text", "number", "boolean", "date", "dropdown"]),
      options: z.array(z.string()).optional(),
      required: z.boolean().optional(),
    })).optional(),
  })
});

export const ReportTemplateValidations = {
  createReportTemplateSchema,
  updateReportTemplateSchema,
};
