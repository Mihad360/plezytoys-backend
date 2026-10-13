import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { TrainingRecordModel } from "./trainingRecord.model";
import { ITrainingRecord } from "./trainingRecord.interface";
import { UserModel } from "../User/user.model";

const assignTraining = async (companyId: string, payload: Partial<ITrainingRecord>) => {
  const user = await UserModel.findOne({ _id: payload.user, company: companyId });
  if (!user) throw new AppError(HttpStatus.NOT_FOUND, "User not found in this company");

  const newRecord = await TrainingRecordModel.create({
    ...payload,
    courseName: payload.courseName || (payload as any).title || "General Training",
    provider: payload.provider || "Training Academy",
    completedDate: payload.completedDate || (payload as any).completionDate || new Date(),
    status: payload.status || "valid",
    company: companyId,
  });
  return newRecord;
};

const getMyTraining = async (userId: string) => {
  return await TrainingRecordModel.find({ user: userId, isActive: true })
    .sort({ completedDate: -1 });
};

const getCompanyTraining = async (companyId: string) => {
  return await TrainingRecordModel.find({ company: companyId, isActive: true })
    .populate("user", "firstName lastName email name employeeId avatar")
    .sort({ createdAt: -1 });
};

const updateTrainingStatus = async (id: string, companyId: string, payload: Partial<ITrainingRecord>) => {
  const record = await TrainingRecordModel.findOne({ _id: id, company: companyId });
  if (!record) {
    throw new AppError(HttpStatus.NOT_FOUND, "Training record not found");
  }

  if (payload.status === "completed" && record.status !== "completed") {
    payload.completedDate = new Date();
  }

  return await TrainingRecordModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

const deleteTrainingRecordFromDB = async (id: string, companyId: string) => {
  const record = await TrainingRecordModel.findOneAndDelete({ _id: id, company: companyId });
  if (!record) {
    throw new AppError(HttpStatus.NOT_FOUND, "Training record not found");
  }
  return record;
};

export const TrainingRecordServices = {
  assignTraining,
  getMyTraining,
  getCompanyTraining,
  updateTrainingStatus,
  deleteTrainingRecordFromDB,
};
