import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AnnouncementControllers } from "./announcement.controller";
import { AnnouncementValidations } from "./announcement.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin", "manager"),
  validateRequest(AnnouncementValidations.createAnnouncementSchema),
  AnnouncementControllers.createAnnouncement
);

router.get(
  "/",
  auth("company_admin", "manager", "employee"),
  AnnouncementControllers.getCompanyAnnouncements
);

router.post(
  "/:id/read",
  auth("company_admin", "manager", "employee"),
  AnnouncementControllers.markAsRead
);

export const AnnouncementRoutes = router;
