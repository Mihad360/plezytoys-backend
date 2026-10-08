import express from "express";
import { AuditLogControllers } from "./auditLog.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/",
  auth("super_admin"),
  AuditLogControllers.getGlobalLogs
);

router.get(
  "/company",
  auth("company_admin"),
  AuditLogControllers.getCompanyLogs
);

export const AuditLogRoutes = router;
