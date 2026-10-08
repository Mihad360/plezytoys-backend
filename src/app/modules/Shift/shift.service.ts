import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { ShiftModel } from "./shift.model";
import { IShift } from "./shift.interface";
import { UserModel } from "../User/user.model";
import { LocationModel } from "../Location/location.model";
import { sendNotification } from "../Notification/notification.utils";

const createShift = async (managerId: string, companyId: string, payload: Partial<IShift>) => {
  const user = await UserModel.findOne({ _id: payload.user, company: companyId });
  if (!user) throw new AppError(HttpStatus.NOT_FOUND, "Assigned user not found");
  
  const location = await LocationModel.findOne({ _id: payload.location, company: companyId });
  if (!location) throw new AppError(HttpStatus.NOT_FOUND, "Location not found");

  const newShift = await ShiftModel.create({
    ...payload,
    company: companyId,
    manager: managerId,
    customer: location.customer,
  });

  if (payload.user) {
    await sendNotification({
      recipientId: payload.user.toString(),
      senderId: managerId,
      type: "shift",
      title: "New Shift Assigned",
      message: `You have been scheduled for a shift at ${location.name} on ${newShift.date} (${newShift.startTime} - ${newShift.endTime}).`,
      data: { shiftId: newShift._id.toString(), locationId: location._id.toString() },
    });
  }
  
  return newShift;
};

const getMyShifts = async (userId: string) => {
  return await ShiftModel.find({ user: userId })
    .populate("location", "name address")
    .sort({ date: 1, startTime: 1 });
};

const getCompanyShifts = async (companyId: string) => {
  return await ShiftModel.find({ company: companyId })
    .populate("user", "firstName lastName")
    .populate("location", "name")
    .sort({ date: 1, startTime: 1 });
};

const updateShiftStatus = async (id: string, companyId: string, payload: Partial<IShift>) => {
  const shift = await ShiftModel.findOne({ _id: id, company: companyId });
  if (!shift) {
    throw new AppError(HttpStatus.NOT_FOUND, "Shift not found");
  }

  const updatedShift = await ShiftModel.findByIdAndUpdate(id, { $set: payload }, { new: true });

  if (shift.user && payload.status) {
    await sendNotification({
      recipientId: shift.user.toString(),
      type: "shift",
      title: "Shift Status Updated",
      message: `Your shift on ${shift.date} status is now ${payload.status}.`,
      data: { shiftId: shift._id.toString() },
    });
  }

  return updatedShift;
};

export const ShiftServices = {
  createShift,
  getMyShifts,
  getCompanyShifts,
  updateShiftStatus
};
