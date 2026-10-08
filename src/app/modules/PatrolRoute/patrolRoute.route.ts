import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PatrolRouteControllers } from "./patrolRoute.controller";
import { PatrolRouteValidations } from "./patrolRoute.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin", "company_admin", "manager"),
  validateRequest(PatrolRouteValidations.createPatrolRouteSchema),
  PatrolRouteControllers.createPatrolRoute
);

router.get(
  "/",
  auth("super_admin", "company_admin", "manager", "employee"),
  PatrolRouteControllers.getAllPatrolRoutes
);

router.get(
  "/:id",
  auth("super_admin", "company_admin", "manager", "employee"),
  PatrolRouteControllers.getPatrolRouteById
);

router.patch(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  validateRequest(PatrolRouteValidations.updatePatrolRouteSchema),
  PatrolRouteControllers.updatePatrolRoute
);

router.delete(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  PatrolRouteControllers.deletePatrolRoute
);

export const PatrolRoutesRoutes = router; // Kept distinct to avoid confusion
