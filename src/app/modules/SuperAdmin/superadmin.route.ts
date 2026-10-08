import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { SuperAdminControllers } from "./superadmin.controller";
import { SuperAdminValidations } from "./superadmin.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/users",
  auth("super_admin"),
  SuperAdminControllers.getAllPlatformUsers
);

router.patch(
  "/role/update/:id",
  auth("super_admin"),
  validateRequest(SuperAdminValidations.updateRoleSchema),
  SuperAdminControllers.updateUserRole
);

router.patch(
  "/status/update/:id",
  auth("super_admin"),
  validateRequest(SuperAdminValidations.updateStatusSchema),
  SuperAdminControllers.updateUserStatus
);

router.get(
  "/dashboard-stats",
  auth("super_admin"),
  SuperAdminControllers.getDashboardStats
);

router.get(
  "/dashboard-charts",
  auth("super_admin"),
  SuperAdminControllers.getDashboardCharts
);

router.get(
  "/trials",
  auth("super_admin"),
  SuperAdminControllers.getTrialsAndPilots
);

router.post(
  "/trials/activate-pilot",
  auth("super_admin"),
  SuperAdminControllers.activatePilot
);

export const SuperAdminRoutes = router;
