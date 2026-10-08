import { Model, Types } from "mongoose";

export interface ISubscriptionPlan {
  _id?: Types.ObjectId;
  name: string; // "Starter", "Professional", "Enterprise"
  price: number;
  billingPeriod: "monthly" | "yearly";
  
  features: string[];
  maxEmployees?: number; // 0 or undefined for unlimited
  maxLocations?: number;
  maxModules?: string[];
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubscriptionPlanInterface extends Model<ISubscriptionPlan> {}
