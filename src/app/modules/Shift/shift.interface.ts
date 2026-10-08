import { Model, Types } from "mongoose";

export interface IShift {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // User to whom the shift is assigned
  company: Types.ObjectId;
  location: Types.ObjectId;
  
  date: Date; // e.g. 2026-09-05
  startTime: string; // "08:00"
  endTime: string; // "16:00"
  
  status: "upcoming" | "active" | "completed" | "missed" | "cancelled";
  
  manager?: Types.ObjectId;
  customer?: Types.ObjectId;
  
  notes?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ShiftInterface extends Model<IShift> {}
