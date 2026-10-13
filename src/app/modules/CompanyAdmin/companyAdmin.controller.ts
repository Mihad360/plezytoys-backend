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

const createEmployee = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.createEmployee(userDoc.company.toString(), req.body);
  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Employee created successfully",
    data: result,
  });
});

const updateEmployee = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.updateEmployee(userDoc.company.toString(), req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Employee updated successfully",
    data: result,
  });
});

const deleteEmployee = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.deleteEmployee(userDoc.company.toString(), req.params.id as string);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Employee deactivated successfully",
    data: result,
  });
});

const getCompanyManagers = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.getCompanyManagersFromDB(userDoc.company.toString(), req.query);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company managers retrieved successfully",
    data: result,
  });
});

const createManager = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.createManager(userDoc.company.toString(), req.body);
  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Manager invited/created successfully",
    data: result,
  });
});

const updateManager = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.updateManager(userDoc.company.toString(), req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager updated successfully",
    data: result,
  });
});

const deleteManager = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyAdminServices.deleteManager(userDoc.company.toString(), req.params.id as string);
  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Manager deactivated successfully",
    data: result,
  });
});

export const CompanyAdminControllers = {
  getDashboardStats,
  getDashboardCharts,
  getCompanyEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getCompanyManagers,
  createManager,
  updateManager,
  deleteManager,
  getWorkingTime,
  updateSettings
};
