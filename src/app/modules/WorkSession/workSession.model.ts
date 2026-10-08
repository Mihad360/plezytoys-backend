import { Schema, model } from "mongoose";
import { IWorkSession, WorkSessionInterface } from "./workSession.interface";

const geoSchema = new Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    isVerified: { type: Boolean, default: true },
    isAnomaly: { type: Boolean, default: false },
  },
  { _id: false }
);

const workSessionSchema = new Schema<IWorkSession, WorkSessionInterface>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    shift: { type: Schema.Types.ObjectId, ref: "Shift" },
    
    clockInTime: { type: Date, required: true },
    clockOutTime: { type: Date },
    
    clockInLocation: { type: geoSchema },
    clockOutLocation: { type: geoSchema },
    
    lastPingAt: { type: Date },
    lastPingLocation: { type: geoSchema },
    
    status: {
      type: String,
      enum: ["active", "completed", "auto_clocked_out"],
      default: "active",
    },
    
    durationMinutes: { type: Number },
    deviceInfo: { type: String },
    deviceId: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const WorkSessionModel = model<IWorkSession, WorkSessionInterface>("WorkSession", workSessionSchema);
