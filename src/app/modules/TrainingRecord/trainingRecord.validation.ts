import { z } from "zod";

export const assignTrainingSchema = z.object({
  body: z.object({
    user: z.string().min(1, "User ID is required"),
    title: z.string().optional(),
    courseName: z.string().optional(),
    provider: z.string().optional(),
    completedDate: z.string().or(z.date()).optional(),
    completionDate: z.string().or(z.date()).optional(),
    expiryDate: z.string().or(z.date()).optional(),
    status: z.enum(["valid", "expiring_soon", "expired", "assigned", "in_progress", "completed"]).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    certificateUrl: z.string().optional(),
  }).refine((data) => Boolean(data.title || data.courseName), {
    message: "Either courseName or title is required",
    path: ["courseName"],
  }),
});

export const updateTrainingSchema = z.object({
  body: z.object({
    status: z.enum(["valid", "expiring_soon", "expired", "assigned", "in_progress", "completed"]).optional(),
    certificate: z.string().optional(),
    certificateUrl: z.string().optional(),
    courseName: z.string().optional(),
    title: z.string().optional(),
    provider: z.string().optional(),
    completedDate: z.string().or(z.date()).optional(),
    completionDate: z.string().or(z.date()).optional(),
    expiryDate: z.string().or(z.date()).optional(),
    notes: z.string().optional(),
  }),
});

export const TrainingRecordValidations = {
  assignTrainingSchema,
  updateTrainingSchema,
};
