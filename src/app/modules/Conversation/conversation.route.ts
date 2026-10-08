import express from "express";
import { conversationControllers } from "./conversation.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("user", "admin", "super_admin", "company_admin", "manager", "employee"),
  conversationControllers.createOrGetConversation,
);

router.get(
  "/",
  auth("user", "admin", "super_admin", "company_admin", "manager", "employee"),
  conversationControllers.getMyConversations,
);

router.get(
  "/:id",
  auth("user", "admin", "super_admin", "company_admin", "manager", "employee"),
  conversationControllers.getConversationById,
);

router.delete(
  "/:id",
  auth("user", "admin", "super_admin", "company_admin", "manager", "employee"),
  conversationControllers.deleteConversation,
);

export const conversationRoutes = router;
