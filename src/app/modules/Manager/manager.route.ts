import express from "express";
import { ManagerControllers } from "./manager.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/dashboard-stats",
  auth("company_admin", "manager"),
  ManagerControllers.getDashboardStats
);

router.get(
  "/locations",
  auth("company_admin", "manager"),
  ManagerControllers.getLocations
);

router.get(
  "/employees",
  auth("company_admin", "manager"),
  ManagerControllers.getEmployees
);

router.get(
  "/alerts",
  auth("company_admin", "manager"),
  ManagerControllers.getAlerts
);

router.get(
  "/attendance",
  auth("company_admin", "manager"),
  ManagerControllers.getAttendance
);

export const ManagerRoutes = router;
