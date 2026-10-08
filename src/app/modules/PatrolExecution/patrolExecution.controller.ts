import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PatrolExecutionServices } from "./patrolExecution.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const startExecution = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await PatrolExecutionServices.startExecutionInDB(user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Patrol execution started successfully",
    data: result,
  });
});

const getMyActiveExecution = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await PatrolExecutionServices.getMyActiveExecutionFromDB(user.user.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Active patrol retrieved successfully",
    data: result,
  });
});

const scanCheckpoint = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const result = await PatrolExecutionServices.scanCheckpointInDB(user.user.toString(), id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Checkpoint scanned successfully",
    data: result,
  });
});

const recordMissedCheckpoint = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const result = await PatrolExecutionServices.recordMissedCheckpointInDB(user.user.toString(), id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Missed checkpoint reason recorded",
    data: result,
  });
});

const finishExecution = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const result = await PatrolExecutionServices.finishExecutionInDB(user.user.toString(), id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol execution finished",
    data: result,
  });
});

const getAllExecutions = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const locationId = req.query.locationId as string;
  const executedBy = req.query.executedBy as string;
  const status = req.query.status as string;

  const result = await PatrolExecutionServices.getAllExecutionsFromDB(
    userDoc.company.toString(),
    locationId,
    executedBy,
    status
  );

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol executions retrieved successfully",
    data: result,
  });
});

const getExecutionById = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const id = req.params.id as string;
  const result = await PatrolExecutionServices.getExecutionByIdFromDB(id, userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol execution retrieved successfully",
    data: result,
  });
});

export const PatrolExecutionControllers = {
  startExecution,
  getMyActiveExecution,
  scanCheckpoint,
  recordMissedCheckpoint,
  finishExecution,
  getAllExecutions,
  getExecutionById,
};
