import { Model, Types } from "mongoose";

export interface ILocation {
  _id?: Types.ObjectId;
  locationId?: string; // e.g., "LOC-0012"
  name: string; // e.g., "Amsterdam Zuid — Building C"
  
  company: Types.ObjectId; // ref to Company
  customer?: Types.ObjectId; // ref to Customer
  
  address?: string;
  
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  radius?: number; // meters for geofencing
  timezone?: string; // e.g., "Europe/Amsterdam"
  
  assignedEmployeesCount?: number;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocationInterface extends Model<ILocation> {
  generateLocationId(): Promise<string>;
}
