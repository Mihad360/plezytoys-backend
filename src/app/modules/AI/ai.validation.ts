import { z } from "zod";

export const addKnowledgeSourceSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().optional(),
    fileUrl: z.string().optional(),
    type: z.enum(["document", "url", "text"]),
  })
});

export const askQuestionSchema = z.object({
  body: z.object({
    question: z.string().min(1, "Question is required"),
  })
});

export const updateUnresolvedQuestionSchema = z.object({
  body: z.object({
    suggestedAnswer: z.string().optional(),
    status: z.enum(["unresolved", "answered", "dismissed"]).optional(),
  })
});

export const AIValidations = {
  addKnowledgeSourceSchema,
  askQuestionSchema,
  updateUnresolvedQuestionSchema,
};
