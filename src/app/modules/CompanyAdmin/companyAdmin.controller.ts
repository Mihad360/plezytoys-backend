import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CompanyAdminServices } from "./companyAdmin.service";
import AppError from "../../erros/AppError";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";

const getDashboardStats = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const result = await CompanyAdminServices.getCompanyDashboardStats(userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company stats retrieved successfully",
    data: result,
  });
});

const getDashboardCharts = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const result = await CompanyAdminServices.getCompanyDashboardCharts(userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company charts retrieved successfully",
    data: result,
  });
});

const getCompanyEmployees = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const result = await CompanyAdminServices.getCompanyEmployeesFromDB(userDoc.company.toString(), req.query);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company employees retrieved successfully",
    data: result,
  });
});

const getWorkingTime = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const startDate = req.query.startDate as string;
  const result = await CompanyAdminServices.getWorkingTimeWeeklySummary(userDoc.company.toString(), startDate);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Weekly working time summary retrieved successfully",
    data: result,
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const result = await CompanyAdminServices.updateCompanySettings(userDoc.company.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company settings updated successfully",
    data: result,
  });
});

export const CompanyAdminControllers = {
  getDashboardStats,
  getDashboardCharts,
  getCompanyEmployees,
  getWorkingTime,
  updateSettings
};
