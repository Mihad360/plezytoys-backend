import { Schema, model } from "mongoose";
import { IAuditLog, AuditLogInterface } from "./auditLog.interface";

const auditLogSchema = new Schema<IAuditLog, AuditLogInterface>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    
    details: { type: String },
    ipAddress: { type: String },
  },
  {
    timestamps: true,
  }
);

export const AuditLogModel = model<IAuditLog, AuditLogInterface>("AuditLog", auditLogSchema);
