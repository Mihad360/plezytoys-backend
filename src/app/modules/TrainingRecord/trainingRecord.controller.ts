import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TrainingRecordServices } from "./trainingRecord.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const assignTraining = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await TrainingRecordServices.assignTraining(userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Training assigned", data: result });
});

const getMyTraining = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await TrainingRecordServices.getMyTraining(user.user.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "My training records retrieved", data: result });
});

const getCompanyTraining = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await TrainingRecordServices.getCompanyTraining(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company training records retrieved", data: result });
});

const updateTraining = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await TrainingRecordServices.updateTrainingStatus(id, userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Training updated", data: result });
});

export const TrainingRecordControllers = { assignTraining, getMyTraining, getCompanyTraining, updateTraining };
