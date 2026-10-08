import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DocumentServices } from "./document.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createDocument = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await DocumentServices.createDocumentIntoDB(userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Document uploaded successfully", data: result });
});

const getMyDocuments = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await DocumentServices.getMyDocuments(user.user.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Your documents retrieved", data: result });
});

const getCompanyDocuments = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await DocumentServices.getCompanyDocuments(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company documents retrieved", data: result });
});

export const DocumentControllers = { createDocument, getMyDocuments, getCompanyDocuments };
