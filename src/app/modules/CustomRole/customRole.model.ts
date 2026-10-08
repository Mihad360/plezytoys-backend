import { Schema, model } from "mongoose";
import { ICustomRole, CustomRoleInterface } from "./customRole.interface";

const customRoleSchema = new Schema<ICustomRole, CustomRoleInterface>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    
    type: {
      type: String,
      enum: ["system", "custom"],
      default: "custom",
    },
    
    dataScope: {
      type: String,
      enum: ["all", "assigned_customers_only", "assigned_locations_only"],
      default: "all",
    },
    
    permissions: [{ type: String }],
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const CustomRoleModel = model<ICustomRole, CustomRoleInterface>("CustomRole", customRoleSchema);
