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

router.post(
  "/employees",
  auth("company_admin"),
  CompanyAdminControllers.createEmployee
);

router.patch(
  "/employees/:id",
  auth("company_admin"),
  CompanyAdminControllers.updateEmployee
);

router.delete(
  "/employees/:id",
  auth("company_admin"),
  CompanyAdminControllers.deleteEmployee
);

router.get(
  "/managers",
  auth("company_admin"),
  CompanyAdminControllers.getCompanyManagers
);

router.post(
  "/managers",
  auth("company_admin"),
  CompanyAdminControllers.createManager
);

router.patch(
  "/managers/:id",
  auth("company_admin"),
  CompanyAdminControllers.updateManager
);

router.delete(
  "/managers/:id",
  auth("company_admin"),
  CompanyAdminControllers.deleteManager
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
