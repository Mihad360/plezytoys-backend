import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CustomerControllers } from "./customer.controller";
import { CustomerValidations } from "./customer.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin", "company_admin"),
  validateRequest(CustomerValidations.createCustomerSchema),
  CustomerControllers.createCustomer
);

router.get(
  "/",
  auth("super_admin", "company_admin", "manager", "employee"),
  CustomerControllers.getAllCustomers
);

router.get(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  CustomerControllers.getCustomerById
);

router.patch(
  "/:id",
  auth("super_admin", "company_admin"),
  validateRequest(CustomerValidations.updateCustomerSchema),
  CustomerControllers.updateCustomer
);

router.delete(
  "/:id",
  auth("super_admin", "company_admin"),
  CustomerControllers.deleteCustomer
);

export const CustomerRoutes = router;
