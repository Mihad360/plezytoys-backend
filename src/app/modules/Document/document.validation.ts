import { z } from "zod";

export const createDocumentSchema = z.object({
  body: z.object({
    user: z.string().min(1, "User ID is required"),
    name: z.string().min(1, "Document name is required"),
    category: z.enum(["certificates", "identification", "qualifications"]),
    documentType: z.string().min(1, "Document type is required"),
    issuedDate: z.string(),
    expiryDate: z.string(),
    fileUrl: z.string().optional(),
  })
});

export const DocumentValidations = {
  createDocumentSchema,
};
