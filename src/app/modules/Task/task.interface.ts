import { Model, Types } from "mongoose";

export interface ITaskChecklistItem {
  _id?: Types.ObjectId;
  text: string;
  isCompleted: boolean;
  isMandatory: boolean;
}

export interface ITask {
  _id?: Types.ObjectId;
  taskId?: string; // e.g., "TSK-204"
  
  title: string;
  description?: string;
  instructions?: string;
  type: "general" | "nfc_linked" | "cleaning" | "security_check";
  
  company: Types.ObjectId;
  location?: Types.ObjectId;
  customer?: Types.ObjectId;
  
  assignedTo?: Types.ObjectId; // ref to User (Employee/Manager)
  createdBy: Types.ObjectId; // ref to User
  
  status: "pending" | "assigned" | "in_progress" | "completed" | "submitted" | "approved" | "rejected" | "returned" | "overdue";
  priority: "low" | "medium" | "high";
  recurrence?: "none" | "daily" | "weekdays" | "weekly" | "monthly";
  
  dueDate?: Date;
  completedAt?: Date;
  
  // Checklist items
  checklist?: ITaskChecklistItem[];
  checklistProgress?: number; // 0 to 100
  
  // Evidence requirement
  requiresEvidence?: boolean;
  attachments?: {
    fileUrl: string;
    type: "photo" | "video" | "file";
  }[];
  completionNotes?: string;
  
  // Review flow (Manager approval/return/reject)
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskInterface extends Model<ITask> {
  generateTaskId(): Promise<string>;
}
