import { Model, Types } from "mongoose";

export interface ITicketMessage {
  sender: Types.ObjectId;
  senderRole: "company_admin" | "super_admin";
  senderName?: string;
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface ISupportTicket {
  _id?: Types.ObjectId;
  ticketNumber?: string; // e.g., "TKT-1001" or "#0001"
  company: Types.ObjectId;
  user: Types.ObjectId; // Who created it
  
  subject: string;
  description: string;
  
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  
  assignedToAdmin?: Types.ObjectId; // Super admin handling it
  
  messages?: ITicketMessage[];
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupportTicketInterface extends Model<ISupportTicket> {
  generateTicketNumber(): Promise<string>;
}
