import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { AnnouncementModel } from "./announcement.model";
import { IAnnouncement } from "./announcement.interface";
import { sendNotificationToCompanyRoles } from "../Notification/notification.utils";

const createAnnouncementIntoDB = async (companyId: string, userId: string, payload: Partial<IAnnouncement>) => {
  const newAnnouncement = await AnnouncementModel.create({
    ...payload,
    company: companyId,
    createdBy: userId,
  });

  await sendNotificationToCompanyRoles({
    companyId,
    roles: ["employee", "manager"],
    type: "announcement",
    title: "New Announcement Published",
    message: newAnnouncement.title,
    data: { announcementId: newAnnouncement._id.toString() },
    senderId: userId,
  });

  return newAnnouncement;
};

const getCompanyAnnouncements = async (companyId: string) => {
  return await AnnouncementModel.find({ company: companyId, isActive: true })
    .sort({ publishedAt: -1 })
    .populate("createdBy", "firstName lastName email");
};

const markAsRead = async (companyId: string, userId: string, announcementId: string) => {
  const announcement = await AnnouncementModel.findOne({ _id: announcementId, company: companyId });
  if (!announcement) {
    throw new AppError(HttpStatus.NOT_FOUND, "Announcement not found");
  }
  
  const alreadyRead = announcement.readBy?.some(r => r.user.toString() === userId);
  if (!alreadyRead) {
    announcement.readBy = announcement.readBy || [];
    announcement.readBy.push({ user: userId as any, readAt: new Date() });
    await announcement.save();
  }
  
  return announcement;
};

export const AnnouncementServices = {
  createAnnouncementIntoDB,
  getCompanyAnnouncements,
  markAsRead
};
