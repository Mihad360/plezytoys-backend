import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { DocumentModel } from "./document.model";
import { IDocument } from "./document.interface";
import { UserModel } from "../User/user.model";

import { sendNotification, sendNotificationToCompanyRoles } from "../Notification/notification.utils";

const createDocumentIntoDB = async (companyId: string, payload: Partial<IDocument>) => {
  const newDocument = await DocumentModel.create({
    ...payload,
    company: companyId,
  });

  if (payload.user) {
    await sendNotification({
      recipientId: payload.user.toString(),
      type: "document",
      title: "Document Added",
      message: `A new document "${newDocument.name}" was added to your profile.`,
      data: { documentId: newDocument._id.toString() },
    });
  }

  return newDocument;
};

const getMyDocuments = async (userId: string) => {
  return await DocumentModel.find({ user: userId, isActive: true }).sort({ expiryDate: 1 });
};

const getCompanyDocuments = async (companyId: string) => {
  return await DocumentModel.find({ company: companyId, isActive: true })
    .sort({ expiryDate: 1 })
    .populate("user", "firstName lastName email");
};

const checkAndNotifyExpiringDocuments = async (companyId: string) => {
  const now = new Date();
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const expiringDocs = await DocumentModel.find({
    company: companyId,
    isActive: true,
    expiryDate: { $lte: twoWeeksLater },
  }).populate("user", "firstName lastName name email");

  for (const doc of expiringDocs) {
    const isExpired = doc.expiryDate && doc.expiryDate < now;
    const user = doc.user as any;

    if (isExpired) {
      await sendNotificationToCompanyRoles({
        companyId,
        roles: ["company_admin"],
        type: "document",
        title: "Expired Certificate",
        message: `${user?.name || user?.firstName || 'An employee'}'s ${doc.name} expired.`,
        data: { documentId: doc._id.toString() },
      });
    } else if (user?._id) {
      await sendNotification({
        recipientId: user._id.toString(),
        type: "document",
        title: "Document Expiring Soon",
        message: `Your ${doc.name} is expiring soon. Please upload a renewed document.`,
        data: { documentId: doc._id.toString() },
      });
    }
  }

  return expiringDocs;
};

export const DocumentServices = {
  createDocumentIntoDB,
  getMyDocuments,
  getCompanyDocuments,
  checkAndNotifyExpiringDocuments,
};
