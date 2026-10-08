import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { PaymentModel } from "./payment.model";
import { IPayment } from "./payment.interface";

const createPayment = async (payload: Partial<IPayment>) => {
  return await PaymentModel.create(payload);
};

const getCompanyPayments = async (companyId: string) => {
  return await PaymentModel.find({ company: companyId })
    .populate("subscriptionPlan")
    .sort({ createdAt: -1 });
};

const getAllPayments = async () => {
  return await PaymentModel.find()
    .populate("company", "name")
    .populate("subscriptionPlan", "name")
    .sort({ createdAt: -1 });
};

const updatePaymentStatus = async (id: string, payload: Partial<IPayment>) => {
  const payment = await PaymentModel.findById(id);
  if (!payment) throw new AppError(HttpStatus.NOT_FOUND, "Payment not found");

  if (payload.status === "paid" && payment.status !== "paid") {
    payload.paidAt = new Date();
  }

  return await PaymentModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

const getPaymentById = async (id: string) => {
  const payment = await PaymentModel.findById(id)
    .populate("company")
    .populate("subscriptionPlan");
  if (!payment) throw new AppError(HttpStatus.NOT_FOUND, "Payment not found");
  return payment;
};

export const PaymentServices = {
  createPayment,
  getCompanyPayments,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus
};
