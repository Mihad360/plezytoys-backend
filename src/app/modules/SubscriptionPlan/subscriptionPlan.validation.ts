import { z } from "zod";

export const createSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    planName: z.string().optional(),
    price: z.union([z.number(), z.string()]).optional(),
    monthlyPrice: z.union([z.number(), z.string()]).optional(),
    annualPrice: z.union([z.number(), z.string()]).optional(),
    billingPeriod: z.string().optional(),
    features: z.array(z.string()).optional(),
    selectedModules: z.array(z.string()).optional(),
    maxEmployees: z.union([z.number(), z.string()]).optional(),
    employeesLimit: z.union([z.number(), z.string()]).optional(),
    maxLocations: z.union([z.number(), z.string()]).optional(),
    locationsLimit: z.union([z.number(), z.string()]).optional(),
    maxModules: z.array(z.string()).optional(),
    description: z.string().optional(),
    planStatus: z.string().optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => Boolean(data.name || data.planName), {
    message: "Plan name is required",
    path: ["name"],
  })
});

export const updateSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    planName: z.string().optional(),
    price: z.union([z.number(), z.string()]).optional(),
    monthlyPrice: z.union([z.number(), z.string()]).optional(),
    annualPrice: z.union([z.number(), z.string()]).optional(),
    billingPeriod: z.string().optional(),
    features: z.array(z.string()).optional(),
    selectedModules: z.array(z.string()).optional(),
    maxEmployees: z.union([z.number(), z.string()]).optional(),
    employeesLimit: z.union([z.number(), z.string()]).optional(),
    maxLocations: z.union([z.number(), z.string()]).optional(),
    locationsLimit: z.union([z.number(), z.string()]).optional(),
    maxModules: z.array(z.string()).optional(),
    description: z.string().optional(),
    planStatus: z.string().optional(),
    isActive: z.boolean().optional(),
  })
});

export const SubscriptionPlanValidations = {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
};
