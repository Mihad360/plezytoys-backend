import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReportTemplateControllers } from "./reportTemplate.controller";
import { ReportTemplateValidations } from "./reportTemplate.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin"),
  validateRequest(ReportTemplateValidations.createReportTemplateSchema),
  ReportTemplateControllers.createReportTemplate
);

router.get(
  "/",
  auth("company_admin", "manager", "employee"),
  ReportTemplateControllers.getCompanyReportTemplates
);

router.patch(
  "/:id",
  auth("company_admin"),
  validateRequest(ReportTemplateValidations.updateReportTemplateSchema),
  ReportTemplateControllers.updateReportTemplate
);

export const ReportTemplateRoutes = router;
