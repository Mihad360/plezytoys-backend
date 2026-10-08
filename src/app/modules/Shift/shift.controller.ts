import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ShiftServices } from "./shift.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createShift = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ShiftServices.createShift(user.user.toString(), userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Shift created", data: result });
});

const getMyShifts = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await ShiftServices.getMyShifts(user.user.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "My shifts retrieved", data: result });
});

const getCompanyShifts = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ShiftServices.getCompanyShifts(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company shifts retrieved", data: result });
});

const updateShift = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ShiftServices.updateShiftStatus(id, userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Shift updated", data: result });
});

export const ShiftControllers = { createShift, getMyShifts, getCompanyShifts, updateShift };
