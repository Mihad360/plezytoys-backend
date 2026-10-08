import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { WorkSessionControllers } from "./workSession.controller";
import { WorkSessionValidations } from "./workSession.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/clock-in",
  auth("employee", "manager"),
  validateRequest(WorkSessionValidations.clockInSchema),
  WorkSessionControllers.clockIn
);

router.post(
  "/clock-out",
  auth("employee", "manager"),
  validateRequest(WorkSessionValidations.clockOutSchema),
  WorkSessionControllers.clockOut
);

router.get(
  "/active",
  auth("employee", "manager"),
  WorkSessionControllers.getActiveSession
);

router.post(
  "/heartbeat",
  auth("employee", "manager"),
  WorkSessionControllers.pingHeartbeat
);

router.get(
  "/me",
  auth("employee", "manager"),
  WorkSessionControllers.getMySessions
);

router.get(
  "/",
  auth("super_admin", "company_admin", "manager"),
  WorkSessionControllers.getCompanySessions
);

export const WorkSessionRoutes = router;
