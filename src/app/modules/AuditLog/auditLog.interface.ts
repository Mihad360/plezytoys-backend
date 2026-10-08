import { Model, Types } from "mongoose";

export interface IAuditLog {
  _id?: Types.ObjectId;
  company?: Types.ObjectId; // Optional if it's a super-admin action
  user: Types.ObjectId; // Who did it
  
  action: string; // e.g., "CREATED_USER", "DELETED_LOCATION"
  entityType: string; // e.g., "User", "Location"
  entityId?: Types.ObjectId; // The ID of the affected resource
  
  details?: string;
  ipAddress?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLogInterface extends Model<IAuditLog> {}
