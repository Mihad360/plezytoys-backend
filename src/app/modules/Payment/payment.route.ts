import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentControllers } from "./payment.controller";
import { PaymentValidations } from "./payment.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin"),
  validateRequest(PaymentValidations.createPaymentSchema),
  PaymentControllers.createPayment
);

router.get(
  "/",
  auth("super_admin"),
  PaymentControllers.getAllPayments
);

router.get(
  "/company",
  auth("company_admin"),
  PaymentControllers.getCompanyPayments
);

router.get(
  "/:id",
  auth("super_admin", "company_admin"),
  PaymentControllers.getPaymentById
);

router.patch(
  "/:id",
  auth("super_admin"),
  validateRequest(PaymentValidations.updatePaymentSchema),
  PaymentControllers.updatePayment
);

export const PaymentRoutes = router;
