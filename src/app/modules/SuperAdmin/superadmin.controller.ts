import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SuperAdminServices } from "./superadmin.service";

const getAllPlatformUsers = catchAsync(async (req, res) => {
  const result = await SuperAdminServices.getAllPlatformUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "All platform users retrieved successfully",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { role } = req.body;
  const result = await SuperAdminServices.updateUserRoleInDB(id, role);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const result = await SuperAdminServices.updateUserStatusInDB(id, status);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await SuperAdminServices.getGlobalDashboardStats();

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Platform stats retrieved successfully",
    data: result,
  });
});

const getDashboardCharts = catchAsync(async (req, res) => {
  const result = await SuperAdminServices.getGlobalDashboardCharts();

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Platform charts retrieved successfully",
    data: result,
  });
});

const getTrialsAndPilots = catchAsync(async (req, res) => {
  const result = await SuperAdminServices.getTrialsAndPilotsFromDB();

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Trials and pilots retrieved successfully",
    data: result,
  });
});

const activatePilot = catchAsync(async (req, res) => {
  const { companyId, durationDays, enabledModules } = req.body;
  const result = await SuperAdminServices.activatePilotInDB(companyId, { durationDays, enabledModules });

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Pilot activated successfully",
    data: result,
  });
});

export const SuperAdminControllers = {
  getAllPlatformUsers,
  updateUserRole,
  updateUserStatus,
  getDashboardStats,
  getDashboardCharts,
  getTrialsAndPilots,
  activatePilot,
};
