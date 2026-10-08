import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuditLogServices } from "./auditLog.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const getCompanyLogs = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await AuditLogServices.getCompanyLogs(userDoc.company.toString(), req.query);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company logs retrieved", meta: result.meta, data: result.logs });
});

const getGlobalLogs = catchAsync(async (req, res) => {
  const result = await AuditLogServices.getGlobalLogs(req.query);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Global logs retrieved", meta: result.meta, data: result.logs });
});

export const AuditLogControllers = { getCompanyLogs, getGlobalLogs };
