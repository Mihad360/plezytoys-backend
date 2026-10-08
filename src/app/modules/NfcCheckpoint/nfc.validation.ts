import { z } from "zod";

export const createNfcCheckpointSchema = z.object({
  body: z.object({
    tagId: z.string().min(1, "Tag ID is required"),
    name: z.string().min(1, "Name is required"),
    company: z.string().optional(),
    location: z.string().min(1, "Location ID is required"),
    customer: z.string().optional(),
    status: z.enum(["active", "inactive", "maintenance"]).optional(),
    placementDescription: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    linkedTasks: z.array(z.string()).optional(),
  })
});

export const updateNfcCheckpointSchema = z.object({
  body: z.object({
    tagId: z.string().optional(),
    name: z.string().optional(),
    location: z.string().optional(),
    customer: z.string().optional().or(z.literal("")),
    status: z.enum(["active", "inactive", "maintenance"]).optional(),
    placementDescription: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    linkedTasks: z.array(z.string()).optional(),
  })
});

export const NfcValidations = {
  createNfcCheckpointSchema,
  updateNfcCheckpointSchema,
};
