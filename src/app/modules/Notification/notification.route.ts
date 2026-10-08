import express from "express";
import { notificationControllers } from "./notification.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/",
  auth("super_admin", "company_admin", "manager", "employee", "admin", "user"),
  notificationControllers.getMyNotifications,
);

router.patch(
  "/:id/read",
  auth("super_admin", "company_admin", "manager", "employee", "admin", "user"),
  notificationControllers.markAsRead,
);

router.patch(
  "/read-all",
  auth("super_admin", "company_admin", "manager", "employee", "admin", "user"),
  notificationControllers.markAllAsRead,
);

router.get(
  "/unread-count",
  auth("super_admin", "company_admin", "manager", "employee", "admin", "user"),
  notificationControllers.getUnreadCount,
);

export const notificationRoutes = router;
