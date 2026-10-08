import express from "express";
import { EmployeeControllers } from "./employee.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/home-summary",
  auth("employee", "manager"),
  EmployeeControllers.getHomeSummary
);

router.get(
  "/dashboard-stats",
  auth("employee", "manager"),
  EmployeeControllers.getHomeSummary
);

router.get(
  "/history",
  auth("employee", "manager"),
  EmployeeControllers.getOperationalHistory
);

router.get(
  "/locations",
  auth("employee", "manager"),
  EmployeeControllers.getAuthorizedLocations
);

router.post(
  "/sync",
  auth("employee", "manager"),
  EmployeeControllers.syncOffline
);

router.get(
  "/next-employee-id",
  auth("super_admin", "company_admin", "manager", "employee"),
  EmployeeControllers.getNextEmployeeId
);

export const EmployeeRoutes = router;
