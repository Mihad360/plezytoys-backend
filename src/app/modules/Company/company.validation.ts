import { z } from "zod";

const addressValidationSchema = z.object({
  street: z.string().min(1).optional(),
  houseNumber: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  province: z.string().optional(),
  country: z.string().min(1).optional(),
});

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    companyName: z.string().optional(),
    legalName: z.string().optional(),
    tradingName: z.string().optional(),
    registrationNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    sector: z.string().optional(),
    contactEmail: z.string().email("Invalid email").optional(),
    businessEmail: z.string().email("Invalid email").optional(),
    phone: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: addressValidationSchema.optional(),
    timezone: z.string().optional(),
    adminFirstName: z.string().optional(),
    adminLastName: z.string().optional(),
    adminFullName: z.string().optional(),
    adminEmail: z.string().email().optional(),
    adminPassword: z.string().optional(),
    plan: z.string().optional(),
    subscriptionPlan: z.string().optional(),
    status: z.string().optional(),
    subscriptionStatus: z.string().optional(),
    pilotDuration: z.string().optional(),
  }).refine((data) => Boolean(data.name || data.companyName), {
    message: "Company name is required",
    path: ["companyName"],
  }).refine((data) => Boolean(data.contactEmail || data.businessEmail), {
    message: "Business email is required",
    path: ["businessEmail"],
  })
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    companyName: z.string().optional(),
    legalName: z.string().optional(),
    tradingName: z.string().optional(),
    registrationNumber: z.string().optional(),
    vatNumber: z.string().optional(),
    sector: z.string().optional(),
    contactEmail: z.string().email("Invalid email").optional(),
    businessEmail: z.string().email("Invalid email").optional(),
    phone: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: addressValidationSchema.optional(),
    timezone: z.string().optional(),
    isActive: z.boolean().optional(),
    accountType: z.string().optional(),
    subscriptionPlan: z.string().optional(),
    subscriptionStatus: z.string().optional(),
    pilotDuration: z.string().optional(),
    enabledModules: z.record(z.string(), z.boolean()).optional(),
    limits: z.record(z.string(), z.any()).optional(),
    branding: z.record(z.string(), z.any()).optional(),
    // Allow updating setup progress
    setupProgress: z.object({
      companyProfile: z.boolean().optional(),
      customers: z.boolean().optional(),
      locations: z.boolean().optional(),
      employees: z.boolean().optional(),
      rolesPermissions: z.boolean().optional(),
      nfcCheckpoints: z.boolean().optional(),
      patrolRoutes: z.boolean().optional(),
      tasksChecklists: z.boolean().optional(),
      reportTemplates: z.boolean().optional(),
    }).optional()
  })
});

export const CompanyValidations = {
  createCompanySchema,
  updateCompanySchema,
};
