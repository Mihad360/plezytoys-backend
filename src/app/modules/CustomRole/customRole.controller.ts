import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CustomRoleServices } from "./customRole.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createRole = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CustomRoleServices.createCustomRole(userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Role created successfully", data: result });
});

const getRoles = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CustomRoleServices.getCompanyRoles(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Roles retrieved", data: result });
});

const updateRole = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CustomRoleServices.updateCustomRole(id, userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Role updated", data: result });
});

const assignRole = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const { userId, roleId } = req.body;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CustomRoleServices.assignRoleToUser(userDoc.company.toString(), userId, roleId);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Role assigned successfully", data: result });
});

export const CustomRoleControllers = { createRole, getRoles, updateRole, assignRole };
