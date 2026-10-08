import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionPlanControllers } from "./subscriptionPlan.controller";
import { SubscriptionPlanValidations } from "./subscriptionPlan.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin"),
  validateRequest(SubscriptionPlanValidations.createSubscriptionPlanSchema),
  SubscriptionPlanControllers.createPlan
);

router.get(
  "/",
  auth("super_admin", "company_admin"),
  SubscriptionPlanControllers.getPlans
);

router.get(
  "/:id",
  auth("super_admin", "company_admin"),
  SubscriptionPlanControllers.getPlanById
);

router.patch(
  "/:id",
  auth("super_admin"),
  validateRequest(SubscriptionPlanValidations.updateSubscriptionPlanSchema),
  SubscriptionPlanControllers.updatePlan
);

router.delete(
  "/:id",
  auth("super_admin"),
  SubscriptionPlanControllers.deletePlan
);

export const SubscriptionPlanRoutes = router;
