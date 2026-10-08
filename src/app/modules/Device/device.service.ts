import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { DeviceModel } from "./device.model";
import { IDevice } from "./device.interface";
import { UserModel } from "../User/user.model";

const registerDevice = async (userId: string, payload: Partial<IDevice>) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "User or company not found");
  }

  // Check if device already registered
  const existingDevice = await DeviceModel.findOne({ deviceId: payload.deviceId });
  if (existingDevice) {
    throw new AppError(HttpStatus.CONFLICT, "Device is already registered");
  }

  const newDevice = await DeviceModel.create({
    ...payload,
    user: userId,
    company: user.company,
    registrationStatus: "pending"
  });
  
  return newDevice;
};

const getMyDevices = async (userId: string) => {
  return await DeviceModel.find({ user: userId });
};

const getCompanyDevices = async (companyId: string) => {
  return await DeviceModel.find({ company: companyId })
    .populate("user", "firstName lastName employeeId");
};

const updateDeviceStatus = async (id: string, companyId: string, payload: Partial<IDevice>) => {
  const device = await DeviceModel.findOne({ _id: id, company: companyId });
  if (!device) {
    throw new AppError(HttpStatus.NOT_FOUND, "Device not found");
  }

  if (payload.registrationStatus === "approved" && device.registrationStatus !== "approved") {
    payload.registeredAt = new Date();
  }

  return await DeviceModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

export const DeviceServices = {
  registerDevice,
  getMyDevices,
  getCompanyDevices,
  updateDeviceStatus
};
