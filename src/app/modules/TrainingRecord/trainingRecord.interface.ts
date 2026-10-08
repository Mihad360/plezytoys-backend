import { Model, Types } from "mongoose";

export interface ITrainingRecord {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // Employee
  company: Types.ObjectId;
  
  courseName: string;
  provider: string; // e.g., "Security Academy NL", "Red Cross"
  
  completedDate?: Date;
  expiryDate?: Date;
  
  status: "valid" | "expiring_soon" | "expired" | "assigned" | "in_progress" | "completed";
  
  certificateUrl?: string;
  notes?: string;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TrainingRecordInterface extends Model<ITrainingRecord> {}
