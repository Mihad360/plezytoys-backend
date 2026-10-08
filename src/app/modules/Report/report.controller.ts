import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReportServices } from "./report.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createReport = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await ReportServices.createReportIntoDB(user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Report submitted successfully",
    data: result,
  });
});

const getAllReports = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const locationId = req.query.locationId as string;
  const status = req.query.status as string;
  const authorId = req.query.authorId as string;
  const searchTerm = req.query.searchTerm as string;

  const result = await ReportServices.getAllReportsFromDB(
    userDoc.company.toString(),
    locationId,
    status,
    authorId,
    user.role === "employee" ? user.user.toString() : undefined,
    searchTerm
  );

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Reports retrieved successfully",
    data: result,
  });
});

const getReportById = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const id = req.params.id as string;
  const result = await ReportServices.getReportByIdFromDB(id, userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Report retrieved successfully",
    data: result,
  });
});

const updateReport = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const id = req.params.id as string;
  const result = await ReportServices.updateReportInDB(id, userDoc.company.toString(), user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Report updated successfully",
    data: result,
  });
});

const reviewReport = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const result = await ReportServices.reviewReportInDB(id, user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: `Report ${req.body.status} successfully`,
    data: result,
  });
});

export const ReportControllers = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  reviewReport,
};
