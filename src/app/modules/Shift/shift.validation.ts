import { z } from "zod";

export const createShiftSchema = z.object({
  body: z.object({
    user: z.string().min(1, "User ID is required"),
    location: z.string().min(1, "Location ID is required"),
    date: z.string(), // ISO Date string
    startTime: z.string(), // "HH:mm"
    endTime: z.string(), // "HH:mm"
    notes: z.string().optional(),
  })
});

export const updateShiftSchema = z.object({
  body: z.object({
    status: z.enum(["upcoming", "active", "completed", "missed", "cancelled"]).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    date: z.string().optional(),
  })
});

export const ShiftValidations = {
  createShiftSchema,
  updateShiftSchema,
};
