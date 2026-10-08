import { Schema, model } from "mongoose";
import { IDevice, DeviceInterface } from "./device.interface";

const deviceSchema = new Schema<IDevice, DeviceInterface>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    
    deviceName: { type: String, required: true },
    deviceId: { type: String, required: true, unique: true },
    
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "revoked"],
      default: "pending",
    },
    registeredAt: { type: Date },
    
    isCurrentDevice: { type: Boolean, default: true },
    isLostOrStolen: { type: Boolean, default: false },
    
    autoLockMinutes: { type: Number, default: 5 },
  },
  {
    timestamps: true,
  }
);

export const DeviceModel = model<IDevice, DeviceInterface>("Device", deviceSchema);
