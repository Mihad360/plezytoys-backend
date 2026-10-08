import { Schema, model } from "mongoose";
import { ISubscriptionPlan, SubscriptionPlanInterface } from "./subscriptionPlan.interface";

const subscriptionPlanSchema = new Schema<ISubscriptionPlan, SubscriptionPlanInterface>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    billingPeriod: { type: String, enum: ["monthly", "yearly"], required: true },
    
    features: [{ type: String }],
    maxEmployees: { type: Number },
    maxLocations: { type: Number },
    maxModules: [{ type: String }],
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionPlanModel = model<ISubscriptionPlan, SubscriptionPlanInterface>("SubscriptionPlan", subscriptionPlanSchema);
