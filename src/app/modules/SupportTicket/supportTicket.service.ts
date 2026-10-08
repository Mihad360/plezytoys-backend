import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { SupportTicketModel } from "./supportTicket.model";
import { ISupportTicket, ITicketMessage } from "./supportTicket.interface";
import QueryBuilder from "../../../builder/QueryBuilder";
import { sendNotification, sendNotificationToSuperAdmins } from "../Notification/notification.utils";

const createTicket = async (companyId: string, userId: string, payload: Partial<ISupportTicket>) => {
  const newTicket = await SupportTicketModel.create({
    ...payload,
    company: companyId,
    user: userId,
  });

  await sendNotificationToSuperAdmins({
    type: "support",
    title: "New Support Ticket",
    message: `New ticket #${newTicket.ticketNumber || 'New'}: "${newTicket.subject}" was submitted.`,
    data: { ticketId: newTicket._id.toString() },
    senderId: userId,
  });

  return newTicket;
};

const getCompanyTickets = async (companyId: string, query: Record<string, unknown>) => {
  const ticketQuery = new QueryBuilder(
    SupportTicketModel.find({ company: companyId }).populate("user", "firstName lastName email name"),
    query
  )
    .search(["subject", "description", "ticketNumber"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const tickets = await ticketQuery.modelQuery;
  const meta = await ticketQuery.countTotal();

  return { tickets, meta };
};

const getGlobalTickets = async (query: Record<string, unknown>) => {
  const ticketQuery = new QueryBuilder(
    SupportTicketModel.find()
      .populate("user", "firstName lastName name email")
      .populate("company", "name contactEmail")
      .populate("assignedToAdmin", "firstName lastName name"),
    query
  )
    .search(["subject", "description", "ticketNumber"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const tickets = await ticketQuery.modelQuery;
  const meta = await ticketQuery.countTotal();

  return { tickets, meta };
};

const getTicketById = async (id: string) => {
  const ticket = await SupportTicketModel.findById(id)
    .populate("user", "firstName lastName name email")
    .populate("company", "name contactEmail")
    .populate("assignedToAdmin", "firstName lastName name")
    .populate("messages.sender", "firstName lastName name email role");

  if (!ticket) throw new AppError(HttpStatus.NOT_FOUND, "Ticket not found");
  return ticket;
};

const replyToTicket = async (
  id: string,
  senderId: string,
  senderRole: "company_admin" | "super_admin",
  senderName: string,
  message: string,
  attachments?: string[]
) => {
  const ticket = await SupportTicketModel.findById(id);
  if (!ticket) throw new AppError(HttpStatus.NOT_FOUND, "Ticket not found");

  const newMessage: ITicketMessage = {
    sender: senderId as any,
    senderRole,
    senderName,
    message,
    attachments,
    createdAt: new Date(),
  };

  ticket.messages = ticket.messages || [];
  ticket.messages.push(newMessage);

  // If super admin replies, keep ticket in_progress; if company admin replies, reopen if closed
  if (senderRole === "super_admin" && ticket.status === "open") {
    ticket.status = "in_progress";
  }

  await ticket.save();

  // Notify the other party
  if (senderRole === "super_admin") {
    await sendNotification({
      recipientId: ticket.user.toString(),
      senderId,
      type: "support",
      title: `Reply on Ticket #${ticket.ticketNumber || ticket._id}`,
      message: `${senderName}: ${message.slice(0, 80)}...`,
      data: { ticketId: ticket._id.toString() }
    });
  } else {
    if (ticket.assignedToAdmin) {
      await sendNotification({
        recipientId: ticket.assignedToAdmin.toString(),
        senderId,
        type: "support",
        title: `Reply on Ticket #${ticket.ticketNumber || ticket._id}`,
        message: `${senderName}: ${message.slice(0, 80)}...`,
        data: { ticketId: ticket._id.toString() }
      });
    } else {
      await sendNotificationToSuperAdmins({
        type: "support",
        title: `Reply on Ticket #${ticket.ticketNumber || ticket._id}`,
        message: `${senderName}: ${message.slice(0, 80)}...`,
        data: { ticketId: ticket._id.toString() },
        senderId,
      });
    }
  }

  return ticket;
};

const updateTicket = async (id: string, payload: Partial<ISupportTicket>) => {
  const ticket = await SupportTicketModel.findById(id);
  if (!ticket) throw new AppError(HttpStatus.NOT_FOUND, "Ticket not found");

  return await SupportTicketModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

export const SupportTicketServices = {
  createTicket,
  getCompanyTickets,
  getGlobalTickets,
  getTicketById,
  replyToTicket,
  updateTicket
};
