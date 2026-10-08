import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { WorkSessionServices } from "./workSession.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const clockIn = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await WorkSessionServices.clockInIntoDB(user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Clocked in successfully",
    data: result,
  });
});

const clockOut = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await WorkSessionServices.clockOutInDB(user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Clocked out successfully",
    data: result,
  });
});

const getActiveSession = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await WorkSessionServices.getActiveSessionFromDB(user.user.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Active session retrieved successfully",
    data: result,
  });
});

const pingHeartbeat = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await WorkSessionServices.pingHeartbeatInDB(user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Heartbeat recorded",
    data: result,
  });
});

const getMySessions = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await WorkSessionServices.getMySessionsFromDB(user.user.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Your sessions retrieved successfully",
    data: result,
  });
});

const getCompanySessions = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const locationId = req.query.locationId as string;
  
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const result = await WorkSessionServices.getCompanySessionsFromDB(userDoc.company.toString(), locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company sessions retrieved successfully",
    data: result,
  });
});

export const WorkSessionControllers = {
  clockIn,
  clockOut,
  getActiveSession,
  pingHeartbeat,
  getMySessions,
  getCompanySessions,
};
