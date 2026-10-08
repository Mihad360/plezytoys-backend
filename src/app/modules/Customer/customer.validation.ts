import { z } from "zod";

const addressValidationSchema = z.object({
  streetAddress: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});

export const createCustomerSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, "Company name is required"),
    customerReference: z.string().optional(),
    company: z.string().optional(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    generalEmail: z.string().email("Invalid email").optional(),
    address: addressValidationSchema.optional(),
    businessRegistrationNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    internalNotes: z.string().optional(),
    portalStatus: z.enum(["enabled", "disabled"]).optional(),
  })
});

export const updateCustomerSchema = z.object({
  body: z.object({
    companyName: z.string().optional(),
    customerReference: z.string().optional(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    generalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    address: addressValidationSchema.optional(),
    businessRegistrationNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    internalNotes: z.string().optional(),
    portalStatus: z.enum(["enabled", "disabled"]).optional(),
    isActive: z.boolean().optional(),
    portalConfig: z.object({
      allowedReportTypes: z.array(z.string()).optional(),
      permissions: z.object({
        reports: z.array(z.enum(["view", "download", "comment", "approve"])).optional(),
        tasks: z.boolean().optional(),
        attendance: z.boolean().optional(),
        announcements: z.boolean().optional(),
      }).optional(),
      locationScope: z.array(z.string()).optional(),
    }).optional()
  })
});

export const CustomerValidations = {
  createCustomerSchema,
  updateCustomerSchema,
};
