import HttpStatus from "http-status";
import { ClientSession, Types } from "mongoose";
import { UserModel } from "../../modules/User/user.model";
import {
  INotification,
  SendNotificationPayload,
  TNotificationType,
} from "../../modules/Notification/notification.interface";
import { connectedUsers, io } from "../../utils/socket";
import { sendPushNotifications } from "../../utils/firebase/notification";
import AppError from "../../erros/AppError";
import { NotificationModel } from "./notification.model";

// Map each type to socket event name
const getSocketEvent = (
  type: TNotificationType,
  recipientId: string,
): string => {
  const eventMap: Record<TNotificationType, string> = {
    attendance: `attendance-${recipientId}`,
    patrol: `patrol-${recipientId}`,
    task: `task-${recipientId}`,
    report: `report-${recipientId}`,
    document: `document-${recipientId}`,
    announcement: `announcement-${recipientId}`,
    shift: `shift-${recipientId}`,
    support: `support-${recipientId}`,
    subscription: `subscription-${recipientId}`,
    message: `new_message-${recipientId}`,
    alert: `alert-${recipientId}`,
    account: `account-${recipientId}`,
    system: `system-${recipientId}`,
    user_registration: `user_registration-${recipientId}`,
    general: `notification-${recipientId}`,
  };

  return eventMap[type] || `notification-${recipientId}`;
};

export const createNotification = async (
  payload: INotification,
  session?: ClientSession,
) => {
  try {
    if (!payload) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Payload is required");
    }

    const created = await NotificationModel.create([payload], { session });
    if (!created || !created[0]) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "Notification creation failed",
      );
    }

    return created[0];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating notification:", error);
    throw error;
  }
};

const sendSingleNotification = async ({
  recipientId,
  senderId,
  type = "general",
  title,
  message,
  data,
}: {
  recipientId: Types.ObjectId | string;
  senderId?: Types.ObjectId | string | null;
  type?: TNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) => {
  const recipientIdStr = recipientId.toString();

  // 1. Save to DB
  let savedNotification;
  try {
    savedNotification = await createNotification({
      recipient: new Types.ObjectId(recipientIdStr),
      sender: senderId ? new Types.ObjectId(senderId.toString()) : null,
      type,
      title,
      message,
      data: data || {},
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to persist notification in DB:", error);
  }

  // 2. Socket.io — emit real-time event to user room & socket ID
  try {
    if (io) {
      const socketEvent = getSocketEvent(type, recipientIdStr);
      const eventPayload = {
        _id: savedNotification?._id,
        type,
        title,
        message,
        data: data || {},
        createdAt: savedNotification?.createdAt || new Date(),
      };

      // Emit to user room (covers all active tabs/devices for this user)
      io.to(`user_${recipientIdStr}`).emit(socketEvent, eventPayload);
      io.to(`user_${recipientIdStr}`).emit("notification", eventPayload);

      // Direct socket emit fallback
      const connectedUser = connectedUsers.get(recipientIdStr);
      if (connectedUser) {
        io.to(connectedUser.socketID).emit(socketEvent, eventPayload);
        io.to(connectedUser.socketID).emit("notification", eventPayload);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Socket notification emit failed:", err);
  }

  // 3. Firebase — push notification to mobile app devices
  try {
    const user = await UserModel.findById(recipientIdStr).select("fcmToken");
    if (user?.fcmToken && user.fcmToken.length > 0) {
      await sendPushNotifications(user.fcmToken, title, message);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Push notification failed:", err);
  }

  return savedNotification;
};

export const sendNotification = async (payload: SendNotificationPayload) => {
  const { recipientId, recipientIds, ...rest } = payload;

  const targetIds: (Types.ObjectId | string)[] = [];
  if (recipientId) targetIds.push(recipientId);
  if (recipientIds && Array.isArray(recipientIds)) {
    targetIds.push(...recipientIds);
  }

  // Remove duplicates
  const uniqueIds = Array.from(new Set(targetIds.map(id => id.toString())));

  const results = await Promise.allSettled(
    uniqueIds.map(id => sendSingleNotification({ recipientId: id, ...rest }))
  );

  return results.length === 1 && results[0].status === "fulfilled"
    ? results[0].value
    : results;
};

export const sendNotificationToCompanyRoles = async ({
  companyId,
  roles,
  type = "general",
  title,
  message,
  data,
  senderId,
}: {
  companyId: string | Types.ObjectId;
  roles: string[];
  type?: TNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  senderId?: string | Types.ObjectId | null;
}) => {
  try {
    const users = await UserModel.find({
      company: new Types.ObjectId(companyId.toString()),
      role: { $in: roles as any },
      isDeleted: false,
    }).select("_id role");

    if (!users || users.length === 0) return;

    const recipientIds = users.map((u: any) => u._id);
    await sendNotification({
      recipientIds,
      senderId,
      type,
      title,
      message,
      data,
    });

    // Broadcast to company room in socket
    if (io) {
      const companyRoom = `company_${companyId.toString()}`;
      io.to(companyRoom).emit("company_notification", {
        type,
        title,
        message,
        data: data || {},
        createdAt: new Date(),
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to send notification to company roles:", err);
  }
};

export const sendNotificationToSuperAdmins = async ({
  type = "system",
  title,
  message,
  data,
  senderId,
}: {
  type?: TNotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  senderId?: string | Types.ObjectId | null;
}) => {
  try {
    const admins = await UserModel.find({
      role: "super_admin",
      isDeleted: false,
    }).select("_id");

    if (!admins || admins.length === 0) return;

    const recipientIds = admins.map((a: any) => a._id);
    await sendNotification({
      recipientIds,
      senderId,
      type,
      title,
      message,
      data,
    });

    if (io) {
      io.to("role_super_admin").emit("admin_notification", {
        type,
        title,
        message,
        data: data || {},
        createdAt: new Date(),
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to send notification to super admins:", err);
  }
};
