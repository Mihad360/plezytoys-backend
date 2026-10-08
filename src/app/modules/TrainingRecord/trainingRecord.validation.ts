import { z } from "zod";

export const assignTrainingSchema = z.object({
  body: z.object({
    user: z.string().min(1, "User ID is required"),
    title: z.string().min(1, "Training title is required"),
    description: z.string().optional(),
  })
});

export const updateTrainingSchema = z.object({
  body: z.object({
    status: z.enum(["assigned", "in_progress", "completed"]).optional(),
    certificate: z.string().optional(),
  })
});

export const TrainingRecordValidations = {
  assignTrainingSchema,
  updateTrainingSchema,
};
