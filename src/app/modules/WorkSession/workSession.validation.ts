import { z } from "zod";

const geoValidation = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const clockInSchema = z.object({
  body: z.object({
    location: z.string({ message: "Location ID is required" }),
    clockInLocation: geoValidation.optional(),
    deviceInfo: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const clockOutSchema = z.object({
  body: z.object({
    clockOutLocation: geoValidation.optional(),
    notes: z.string().optional(),
  }),
});

export const WorkSessionValidations = {
  clockInSchema,
  clockOutSchema,
};
