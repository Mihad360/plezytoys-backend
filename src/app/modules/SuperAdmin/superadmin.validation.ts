import { z } from "zod";

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(["super_admin", "company_admin", "manager", "employee", "admin", "user"]),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "inactive", "suspended", "pending"]),
  }),
});

export const SuperAdminValidations = {
  updateRoleSchema,
  updateStatusSchema,
};
