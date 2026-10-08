import { Schema, model } from "mongoose";
import { IShift, ShiftInterface } from "./shift.interface";

const shiftSchema = new Schema<IShift, ShiftInterface>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "missed", "cancelled"],
      default: "upcoming",
    },
    
    manager: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ShiftModel = model<IShift, ShiftInterface>("Shift", shiftSchema);
