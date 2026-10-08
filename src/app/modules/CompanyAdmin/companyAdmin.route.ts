import express from "express";
import { CompanyAdminControllers } from "./companyAdmin.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/dashboard-stats",
  auth("company_admin"),
  CompanyAdminControllers.getDashboardStats
);

router.get(
  "/charts",
  auth("company_admin"),
  CompanyAdminControllers.getDashboardCharts
);

router.get(
  "/employees",
  auth("company_admin"),
  CompanyAdminControllers.getCompanyEmployees
);

router.get(
  "/working-time",
  auth("company_admin"),
  CompanyAdminControllers.getWorkingTime
);

router.patch(
  "/settings",
  auth("company_admin"),
  CompanyAdminControllers.updateSettings
);

export const CompanyAdminRoutes = router;
