import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DeviceServices } from "./device.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const registerDevice = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await DeviceServices.registerDevice(user.user.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Device registered", data: result });
});

const getMyDevices = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await DeviceServices.getMyDevices(user.user.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "My devices retrieved", data: result });
});

const getCompanyDevices = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await DeviceServices.getCompanyDevices(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company devices retrieved", data: result });
});

const updateDevice = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await DeviceServices.updateDeviceStatus(id, userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Device updated", data: result });
});

export const DeviceControllers = { registerDevice, getMyDevices, getCompanyDevices, updateDevice };
