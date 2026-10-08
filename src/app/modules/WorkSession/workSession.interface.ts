import { Model, Types } from "mongoose";

export interface ILocationPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  isVerified?: boolean;
  isAnomaly?: boolean;
}

export interface IWorkSession {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // ref to User (Employee)
  company: Types.ObjectId; // ref to Company
  location: Types.ObjectId; // ref to Location
  shift?: Types.ObjectId; // ref to Shift
  
  clockInTime: Date;
  clockOutTime?: Date;
  
  clockInLocation?: ILocationPoint;
  clockOutLocation?: ILocationPoint;
  
  lastPingAt?: Date;
  lastPingLocation?: ILocationPoint;
  
  status: "active" | "completed" | "auto_clocked_out";
  durationMinutes?: number; // Calculated on clock out
  
  deviceInfo?: string;
  deviceId?: string;
  notes?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkSessionInterface extends Model<IWorkSession> {}
