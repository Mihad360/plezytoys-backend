import { Model, Types } from "mongoose";

export interface IDevice {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  company: Types.ObjectId;
  
  deviceName: string; // e.g. "iPhone 15 Pro"
  deviceId: string; // Hardware unique ID
  
  registrationStatus: "pending" | "approved" | "rejected" | "revoked";
  registeredAt?: Date;
  
  isCurrentDevice: boolean;
  isLostOrStolen: boolean;
  
  autoLockMinutes?: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeviceInterface extends Model<IDevice> {}
