import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PatrolExecutionControllers } from "./patrolExecution.controller";
import { PatrolExecutionValidations } from "./patrolExecution.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/start",
  auth("employee", "manager"),
  validateRequest(PatrolExecutionValidations.startExecutionSchema),
  PatrolExecutionControllers.startExecution
);

router.get(
  "/active",
  auth("employee", "manager"),
  PatrolExecutionControllers.getMyActiveExecution
);

router.post(
  "/:id/scan",
  auth("employee", "manager"),
  validateRequest(PatrolExecutionValidations.scanCheckpointSchema),
  PatrolExecutionControllers.scanCheckpoint
);

router.post(
  "/:id/missed-checkpoint",
  auth("employee", "manager"),
  PatrolExecutionControllers.recordMissedCheckpoint
);

router.post(
  "/:id/finish",
  auth("employee", "manager"),
  validateRequest(PatrolExecutionValidations.finishExecutionSchema),
  PatrolExecutionControllers.finishExecution
);

router.get(
  "/",
  auth("company_admin", "manager", "employee"),
  PatrolExecutionControllers.getAllExecutions
);

router.get(
  "/:id",
  auth("company_admin", "manager", "employee"),
  PatrolExecutionControllers.getExecutionById
);

export const PatrolExecutionRoutes = router;
