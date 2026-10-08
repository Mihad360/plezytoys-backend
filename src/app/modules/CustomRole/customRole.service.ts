import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { CustomRoleModel } from "./customRole.model";
import { ICustomRole } from "./customRole.interface";
import { UserModel } from "../User/user.model";

const createCustomRole = async (companyId: string, payload: Partial<ICustomRole>) => {
  const newRole = await CustomRoleModel.create({
    ...payload,
    company: companyId,
    type: "custom"
  });
  return newRole;
};

const getCompanyRoles = async (companyId: string) => {
  return await CustomRoleModel.find({ company: companyId, isActive: true });
};

const updateCustomRole = async (id: string, companyId: string, payload: Partial<ICustomRole>) => {
  const role = await CustomRoleModel.findOne({ _id: id, company: companyId });
  if (!role) {
    throw new AppError(HttpStatus.NOT_FOUND, "Role not found");
  }

  if (role.type === "system") {
    throw new AppError(HttpStatus.BAD_REQUEST, "Cannot modify system roles directly");
  }

  return await CustomRoleModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

const assignRoleToUser = async (companyId: string, userId: string, roleId: string) => {
  const user = await UserModel.findOne({ _id: userId, company: companyId });
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, "User not found");
  }
  
  const role = await CustomRoleModel.findOne({ _id: roleId, company: companyId });
  if (!role) {
    throw new AppError(HttpStatus.NOT_FOUND, "Role not found");
  }
  
  if (!user.customRoles) user.customRoles = [];
  if (!user.customRoles.includes(role._id as any)) {
    user.customRoles.push(role._id as any);
    await user.save();
  }
  
  return user;
};

export const CustomRoleServices = {
  createCustomRole,
  getCompanyRoles,
  updateCustomRole,
  assignRoleToUser
};
