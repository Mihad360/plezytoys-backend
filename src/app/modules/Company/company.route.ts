import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CompanyControllers } from "./company.controller";
import { CompanyValidations } from "./company.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin", "admin"),
  validateRequest(CompanyValidations.createCompanySchema),
  CompanyControllers.createCompany
);

router.post(
  "/:companyId/admin",
  auth("super_admin", "admin"),
  CompanyControllers.createCompanyAdmin
);

router.get(
  "/my-company",
  auth("company_admin", "manager"),
  CompanyControllers.getMyCompany
);

router.get(
  "/",
  auth("super_admin", "admin"),
  CompanyControllers.getAllCompanies
);

router.get(
  "/:id",
  auth("super_admin", "admin", "company_admin"),
  CompanyControllers.getCompanyById
);

router.patch(
  "/:id/modules",
  auth("super_admin", "admin"),
  CompanyControllers.updateCompanyModules
);

router.patch(
  "/:id",
  auth("super_admin", "admin", "company_admin"),
  validateRequest(CompanyValidations.updateCompanySchema),
  CompanyControllers.updateCompany
);

router.delete(
  "/:id",
  auth("super_admin", "admin"),
  CompanyControllers.deleteCompany
);

export const CompanyRoutes = router;
