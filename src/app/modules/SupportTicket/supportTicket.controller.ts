import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SupportTicketServices } from "./supportTicket.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createTicket = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await SupportTicketServices.createTicket(userDoc.company.toString(), user.user.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Ticket created", data: result });
});

const getCompanyTickets = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await SupportTicketServices.getCompanyTickets(userDoc.company.toString(), req.query);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Company tickets retrieved", meta: result.meta, data: result.tickets });
});

const getGlobalTickets = catchAsync(async (req, res) => {
  const result = await SupportTicketServices.getGlobalTickets(req.query);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Global tickets retrieved", meta: result.meta, data: result.tickets });
});

const getTicketById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await SupportTicketServices.getTicketById(id);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Ticket retrieved successfully", data: result });
});

const replyToTicket = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const userDoc = await UserModel.findById(user.user);
  const senderName = userDoc?.name || `${userDoc?.firstName || ''} ${userDoc?.lastName || ''}`.trim() || userDoc?.email || 'User';
  const senderRole = user.role === "super_admin" ? "super_admin" : "company_admin";

  const { message, attachments } = req.body;
  const result = await SupportTicketServices.replyToTicket(id, user.user.toString(), senderRole, senderName, message, attachments);

  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Reply sent successfully", data: result });
});

const updateTicket = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await SupportTicketServices.updateTicket(id, req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Ticket updated", data: result });
});

export const SupportTicketControllers = {
  createTicket,
  getCompanyTickets,
  getGlobalTickets,
  getTicketById,
  replyToTicket,
  updateTicket
};
