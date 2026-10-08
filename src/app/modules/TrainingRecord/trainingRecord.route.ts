import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TrainingRecordControllers } from "./trainingRecord.controller";
import { TrainingRecordValidations } from "./trainingRecord.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin", "manager"),
  validateRequest(TrainingRecordValidations.assignTrainingSchema),
  TrainingRecordControllers.assignTraining
);

router.get(
  "/me",
  auth("employee", "manager"),
  TrainingRecordControllers.getMyTraining
);

router.get(
  "/",
  auth("company_admin", "manager"),
  TrainingRecordControllers.getCompanyTraining
);

router.patch(
  "/:id",
  auth("company_admin", "manager", "employee"),
  validateRequest(TrainingRecordValidations.updateTrainingSchema),
  TrainingRecordControllers.updateTraining
);

export const TrainingRecordRoutes = router;
