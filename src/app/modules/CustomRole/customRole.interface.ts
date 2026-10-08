import { Model, Types } from "mongoose";

export interface ICustomRole {
  _id?: Types.ObjectId;
  name: string;
  company: Types.ObjectId;
  
  type: "system" | "custom";
  dataScope: "all" | "assigned_customers_only" | "assigned_locations_only";
  
  permissions: string[]; // e.g. ["view_employees", "create_employees", "view_reports", ...]
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomRoleInterface extends Model<ICustomRole> {}
