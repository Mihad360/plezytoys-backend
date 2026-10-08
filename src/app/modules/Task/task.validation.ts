import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    instructions: z.string().optional(),
    type: z.enum(["general", "nfc_linked", "cleaning", "security_check"]).optional(),
    location: z.string().optional(),
    customer: z.string().optional(),
    assignedTo: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    recurrence: z.enum(["none", "daily", "weekdays", "weekly", "monthly"]).optional(),
    dueDate: z.string().optional(), // Can parse to Date later
    requiresEvidence: z.boolean().optional(),
    checklist: z.array(z.object({
      text: z.string(),
      isCompleted: z.boolean().optional().default(false),
      isMandatory: z.boolean().optional().default(false)
    })).optional(),
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    status: z.enum(["pending", "assigned", "in_progress", "completed", "submitted", "approved", "rejected", "returned", "overdue"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    assignedTo: z.string().optional(),
    location: z.string().optional(),
    dueDate: z.string().optional(),
    attachments: z.array(z.object({
      fileUrl: z.string(),
      type: z.enum(["photo", "video", "file"])
    })).optional(),
    checklist: z.array(z.object({
      text: z.string(),
      isCompleted: z.boolean().optional().default(false),
      isMandatory: z.boolean().optional().default(false)
    })).optional(),
    completionNotes: z.string().optional(),
  })
});

export const TaskValidations = {
  createTaskSchema,
  updateTaskSchema,
};
