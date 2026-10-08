import { Schema, model } from "mongoose";
import { IPayment, PaymentInterface } from "./payment.interface";

const paymentSchema = new Schema<IPayment, PaymentInterface>(
  {
    invoiceId: { type: String, unique: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    
    amount: { type: Number, required: true },
    subtotal: { type: Number },
    tax: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "overdue"],
      default: "pending",
    },
    
    stripePaymentIntentId: { type: String },
    stripeSubscriptionId: { type: String },
    stripeInvoiceId: { type: String },
    paymentMethod: { type: String },
    
    paidAt: { type: Date },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    invoiceUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

paymentSchema.statics.generateInvoiceId = async function () {
  const latest = await this.findOne().sort({ createdAt: -1 });
  let nextId = 24001;
  
  if (latest && latest.invoiceId) {
    const parts = latest.invoiceId.split("-");
    if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
      nextId = parseInt(parts[1]) + 1;
    }
  }
  return `INV-${nextId}`;
};

paymentSchema.pre("save", async function () {
  if (!this.invoiceId) {
    this.invoiceId = await (this.constructor as any).generateInvoiceId();
  }
});

export const PaymentModel = model<IPayment, PaymentInterface>("Payment", paymentSchema);
