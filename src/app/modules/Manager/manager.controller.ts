import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ManagerServices } from "./manager.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const getDashboardStats = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const locationId = req.query.locationId as string;
  const result = await ManagerServices.getManagerDashboardStats(user.user.toString(), userDoc.company.toString(), locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager dashboard overview retrieved successfully",
    data: result,
  });
});

const getLocations = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ManagerServices.getManagerLocations(user.user.toString(), userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager locations retrieved successfully",
    data: result,
  });
});

const getEmployees = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const locationId = req.query.locationId as string;
  const result = await ManagerServices.getManagerEmployees(user.user.toString(), userDoc.company.toString(), locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager employees retrieved successfully",
    data: result,
  });
});

const getAlerts = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const locationId = req.query.locationId as string;
  const result = await ManagerServices.getManagerAlerts(user.user.toString(), userDoc.company.toString(), locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager alerts retrieved successfully",
    data: result,
  });
});

const getAttendance = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const locationId = req.query.locationId as string;
  const result = await ManagerServices.getManagerAttendance(user.user.toString(), userDoc.company.toString(), locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager attendance retrieved successfully",
    data: result,
  });
});

export const ManagerControllers = {
  getDashboardStats,
  getLocations,
  getEmployees,
  getAlerts,
  getAttendance,
};
