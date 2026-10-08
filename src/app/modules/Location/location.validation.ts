import { z } from "zod";

export const createLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Location name is required"),
    company: z.string().optional(),
    customer: z.string().optional(),
    address: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    radius: z.number().positive("Radius must be positive").optional(),
    timezone: z.string().optional(),
  })
});

export const updateLocationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    customer: z.string().optional().or(z.literal("")),
    address: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    radius: z.number().positive().optional(),
    timezone: z.string().optional(),
    isActive: z.boolean().optional(),
  })
});

export const LocationValidations = {
  createLocationSchema,
  updateLocationSchema,
};
