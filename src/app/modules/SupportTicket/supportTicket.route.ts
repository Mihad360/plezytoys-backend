import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { SupportTicketControllers } from "./supportTicket.controller";
import { SupportTicketValidations } from "./supportTicket.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin"),
  validateRequest(SupportTicketValidations.createSupportTicketSchema),
  SupportTicketControllers.createTicket
);

router.get(
  "/",
  auth("super_admin"),
  SupportTicketControllers.getGlobalTickets
);

router.get(
  "/company",
  auth("company_admin"),
  SupportTicketControllers.getCompanyTickets
);

router.get(
  "/:id",
  auth("super_admin", "company_admin"),
  SupportTicketControllers.getTicketById
);

router.post(
  "/:id/reply",
  auth("super_admin", "company_admin"),
  SupportTicketControllers.replyToTicket
);

router.patch(
  "/:id",
  auth("super_admin", "company_admin"),
  validateRequest(SupportTicketValidations.updateSupportTicketSchema),
  SupportTicketControllers.updateTicket
);

export const SupportTicketRoutes = router;
