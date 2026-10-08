import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AnnouncementServices } from "./announcement.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createAnnouncement = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await AnnouncementServices.createAnnouncementIntoDB(userDoc.company.toString(), user.user.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Announcement published", data: result });
});

const getCompanyAnnouncements = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await AnnouncementServices.getCompanyAnnouncements(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Announcements retrieved", data: result });
});

const markAsRead = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await AnnouncementServices.markAsRead(userDoc.company.toString(), user.user.toString(), id);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Announcement marked as read", data: result });
});

export const AnnouncementControllers = { createAnnouncement, getCompanyAnnouncements, markAsRead };
