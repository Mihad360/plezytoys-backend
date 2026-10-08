import { z } from "zod";

export const createPatrolRouteSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    company: z.string().optional(),
    location: z.string().min(1, "Location ID is required"),
    checkpoints: z.array(z.object({
      checkpoint: z.string(),
      order: z.number(),
      mandatory: z.boolean().optional(),
      timeLimitMinutes: z.number().optional(),
    })).optional(),
    estimatedDurationMinutes: z.number().optional(),
  })
});

export const updatePatrolRouteSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    checkpoints: z.array(z.object({
      checkpoint: z.string(),
      order: z.number(),
      mandatory: z.boolean().optional(),
      timeLimitMinutes: z.number().optional(),
    })).optional(),
    estimatedDurationMinutes: z.number().optional(),
    isActive: z.boolean().optional(),
  })
});

export const PatrolRouteValidations = {
  createPatrolRouteSchema,
  updatePatrolRouteSchema,
};
