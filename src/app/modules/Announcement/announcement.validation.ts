import { z } from "zod";

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    target: z.enum(["all", "managers", "employees", "specific_team", "specific_location"]).optional(),
    targetEntities: z.array(z.string()).optional(),
  })
});

export const AnnouncementValidations = {
  createAnnouncementSchema,
};
