import { z } from "zod";

export const startExecutionSchema = z.object({
  body: z.object({
    routeId: z.string({ message: "Route ID is required" }),
    locationId: z.string({ message: "Location ID is required" }),
  })
});

export const scanCheckpointSchema = z.object({
  body: z.object({
    checkpointId: z.string({ message: "Checkpoint ID is required" }),
    notes: z.string().optional(),
    photoUrl: z.string().optional(),
  })
});

export const finishExecutionSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
    status: z.enum(["completed", "incomplete", "abandoned"]).optional(),
  })
});

export const PatrolExecutionValidations = {
  startExecutionSchema,
  scanCheckpointSchema,
  finishExecutionSchema,
};
