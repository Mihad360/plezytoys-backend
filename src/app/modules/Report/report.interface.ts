import { Model, Types } from "mongoose";

export interface IReportVerificationData {
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    isVerified?: boolean;
  };
  nfcCheckpoint?: Types.ObjectId;
  originalTimestamp?: Date;
  deviceId?: string;
}

export interface IReport {
  _id?: Types.ObjectId;
  reportId?: string; // e.g., "REP-1024"
  type: "duty" | "round" | "incident" | "custom" | "maintenance" | "general" | "customer";
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "returned" | "open" | "in_progress" | "resolved" | "closed";
  
  title: string;
  description: string;
  
  author: Types.ObjectId; // ref to User (who submitted it)
  company: Types.ObjectId;
  location?: Types.ObjectId;
  customer?: Types.ObjectId;
  
  assignedTo?: Types.ObjectId; // ref to User (manager handling it)
  assignedReviewer?: Types.ObjectId; // ref to User (manager reviewing it)
  reviewedAt?: Date;
  reviewComments?: string;
  
  attachments?: string[]; // Array of file/image URLs
  verificationData?: IReportVerificationData;
  
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportInterface extends Model<IReport> {
  generateReportId(): Promise<string>;
}
