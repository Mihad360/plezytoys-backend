import { Model, Types } from "mongoose";

export interface IPayment {
  _id?: Types.ObjectId;
  invoiceId?: string; // e.g., "INV-24081"
  company: Types.ObjectId;
  subscriptionPlan: Types.ObjectId;
  
  amount: number;
  subtotal?: number;
  tax?: number;
  currency: string;
  
  status: "pending" | "paid" | "failed" | "overdue";
  
  stripePaymentIntentId?: string; // e.g., "pi_3Qs81A72xR"
  stripeSubscriptionId?: string; // e.g., "sub_1Qs..."
  stripeInvoiceId?: string; // e.g., "in_1Qs..."
  paymentMethod?: string; // e.g., "Visa •••• 4242"
  
  paidAt?: Date;
  periodStart?: Date;
  periodEnd?: Date;
  invoiceUrl?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentInterface extends Model<IPayment> {
  generateInvoiceId(): Promise<string>;
}
