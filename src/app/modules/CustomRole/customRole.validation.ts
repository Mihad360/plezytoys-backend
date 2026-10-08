import { z } from "zod";

export const createCustomRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    dataScope: z.enum(["all", "assigned_customers_only", "assigned_locations_only"]).optional(),
    permissions: z.array(z.string()).optional(),
  })
});

export const updateCustomRoleSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    dataScope: z.enum(["all", "assigned_customers_only", "assigned_locations_only"]).optional(),
    permissions: z.array(z.string()).optional(),
  })
});

export const CustomRoleValidations = {
  createCustomRoleSchema,
  updateCustomRoleSchema,
};
