import { Model, Types } from "mongoose";

export interface IDocument {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // ref to User (Employee)
  company: Types.ObjectId; // ref to Company
  
  name: string; // e.g., "Security Certificate"
  category: "certificates" | "identification" | "qualifications";
  documentType: string;
  
  status: "valid" | "expiring_soon" | "expired";
  
  issuedDate: Date;
  expiryDate: Date;
  
  fileUrl?: string;
  verifiedBy?: Types.ObjectId; // ref to User (Company Admin)
  
  syncStatus?: "synced" | "pending" | "failed";
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DocumentInterface extends Model<IDocument> {}
