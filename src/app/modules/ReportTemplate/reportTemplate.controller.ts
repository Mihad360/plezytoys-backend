import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReportTemplateServices } from "./reportTemplate.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createReportTemplate = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ReportTemplateServices.createReportTemplate(userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Template created", data: result });
});

const getCompanyReportTemplates = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ReportTemplateServices.getCompanyReportTemplates(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Templates retrieved", data: result });
});

const updateReportTemplate = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await ReportTemplateServices.updateReportTemplate(id, userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Template updated", data: result });
});

export const ReportTemplateControllers = { createReportTemplate, getCompanyReportTemplates, updateReportTemplate };
