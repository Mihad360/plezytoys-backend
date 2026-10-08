import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { EmployeeServices } from "./employee.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const getHomeSummary = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await EmployeeServices.getEmployeeHomeSummary(user.user.toString(), userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Employee home summary retrieved successfully",
    data: result,
  });
});

const getOperationalHistory = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const filter = req.query.filter as string;
  const result = await EmployeeServices.getEmployeeOperationalHistory(user.user.toString(), filter);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Operational history retrieved successfully",
    data: result,
  });
});

const getAuthorizedLocations = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await EmployeeServices.getEmployeeAuthorizedLocations(user.user.toString(), userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Authorized locations retrieved successfully",
    data: result,
  });
});

const syncOffline = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const items = req.body.items || [];
  const result = await EmployeeServices.batchOfflineSync(user.user.toString(), userDoc.company.toString(), items);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Offline batch sync completed",
    data: result,
  });
});

const getNextEmployeeId = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  let companyId: string | undefined = undefined;
  if (user?.user) {
    const userDoc = await UserModel.findById(user.user);
    if (userDoc?.company) {
      companyId = userDoc.company.toString();
    }
  }

  const result = await EmployeeServices.getNextEmployeeIdToDB(companyId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Next employee ID generated successfully",
    data: result,
  });
});

export const EmployeeControllers = {
  getHomeSummary,
  getOperationalHistory,
  getAuthorizedLocations,
  syncOffline,
  getNextEmployeeId,
};
