import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { TaskControllers } from "./task.controller";
import { TaskValidations } from "./task.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin", "manager"),
  validateRequest(TaskValidations.createTaskSchema),
  TaskControllers.createTask
);

router.get(
  "/",
  auth("company_admin", "manager", "employee"),
  TaskControllers.getAllTasks
);

router.get(
  "/:id",
  auth("company_admin", "manager", "employee"),
  TaskControllers.getTaskById
);

router.patch(
  "/:id",
  auth("company_admin", "manager", "employee"),
  validateRequest(TaskValidations.updateTaskSchema),
  TaskControllers.updateTask
);

router.post(
  "/:id/submit",
  auth("employee", "manager"),
  TaskControllers.submitTask
);

router.post(
  "/:id/review",
  auth("company_admin", "manager"),
  TaskControllers.reviewTask
);

router.patch(
  "/:id/checklist/:itemId",
  auth("employee", "manager"),
  TaskControllers.toggleChecklistItem
);

export const TaskRoutes = router;
