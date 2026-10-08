import { Types } from "mongoose";

export type TNotificationType =
  | "attendance"
  | "patrol"
  | "task"
  | "report"
  | "document"
  | "announcement"
  | "shift"
  | "support"
  | "subscription"
  | "system"
  | "message"
  | "alert"
  | "account"
  | "user_registration"
  | "general";

export interface INotification {
  _id?: Types.ObjectId;
  sender?: Types.ObjectId | null;
  recipient: Types.ObjectId;
  type: TNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SendNotificationPayload {
  recipientId?: Types.ObjectId | string;
  recipientIds?: (Types.ObjectId | string)[];
  senderId?: Types.ObjectId | string | null;
  type?: TNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}
