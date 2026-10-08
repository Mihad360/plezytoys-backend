import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReportControllers } from "./report.controller";
import { ReportValidations } from "./report.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("employee", "manager"),
  validateRequest(ReportValidations.createReportSchema),
  ReportControllers.createReport
);

router.get(
  "/",
  auth("company_admin", "manager", "employee"),
  ReportControllers.getAllReports
);

router.get(
  "/:id",
  auth("company_admin", "manager", "employee"),
  ReportControllers.getReportById
);

router.patch(
  "/:id",
  auth("company_admin", "manager"),
  validateRequest(ReportValidations.updateReportSchema),
  ReportControllers.updateReport
);

router.post(
  "/:id/review",
  auth("company_admin", "manager"),
  ReportControllers.reviewReport
);

export const ReportRoutes = router;
