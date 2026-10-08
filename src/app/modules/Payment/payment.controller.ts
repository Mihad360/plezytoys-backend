import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

import { CompanyModel } from "../Company/company.model";

const createPayment = catchAsync(async (req, res) => {
  let company = req.body.company || req.user?.company;
  if (!company) {
    const defaultCompany = await CompanyModel.findOne({ isActive: true });
    if (defaultCompany) {
      company = defaultCompany._id.toString();
    } else {
      throw new AppError(HttpStatus.BAD_REQUEST, "Company is required");
    }
  }
  const result = await PaymentServices.createPayment({ ...req.body, company });
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Payment created", data: result });
});

const getCompanyPayments = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await PaymentServices.getCompanyPayments(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company payments retrieved", data: result });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await PaymentServices.getAllPayments();
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "All payments retrieved", data: result });
});

const getPaymentById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await PaymentServices.getPaymentById(id);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Payment retrieved", data: result });
});

const updatePayment = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await PaymentServices.updatePaymentStatus(id, req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Payment updated", data: result });
});

export const PaymentControllers = { createPayment, getCompanyPayments, getAllPayments, getPaymentById, updatePayment };
