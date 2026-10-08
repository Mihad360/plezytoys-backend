import { Schema, model } from "mongoose";
import { ITrainingRecord, TrainingRecordInterface } from "./trainingRecord.interface";

const trainingRecordSchema = new Schema<ITrainingRecord, TrainingRecordInterface>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    
    courseName: { type: String, required: true },
    provider: { type: String, required: true },
    
    completedDate: { type: Date },
    expiryDate: { type: Date },
    
    status: {
      type: String,
      enum: ["valid", "expiring_soon", "expired", "assigned", "in_progress", "completed"],
      default: "valid",
    },
    
    certificateUrl: { type: String },
    notes: { type: String },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const TrainingRecordModel = model<ITrainingRecord, TrainingRecordInterface>("TrainingRecord", trainingRecordSchema);
