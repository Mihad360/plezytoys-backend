import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    company: z.string().optional(),
    subscriptionPlan: z.string().min(1, "Subscription Plan ID is required"),
    amount: z.number().min(0),
    currency: z.string().optional(),
    status: z.enum(["pending", "paid", "failed", "overdue"]).optional(),
  })
});

export const updatePaymentSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "paid", "failed", "overdue"]).optional(),
    invoiceUrl: z.string().optional(),
  })
});

export const PaymentValidations = {
  createPaymentSchema,
  updatePaymentSchema,
};
