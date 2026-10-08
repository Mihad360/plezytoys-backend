import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ShiftControllers } from "./shift.controller";
import { ShiftValidations } from "./shift.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin", "manager"),
  validateRequest(ShiftValidations.createShiftSchema),
  ShiftControllers.createShift
);

router.get(
  "/me",
  auth("employee", "manager"),
  ShiftControllers.getMyShifts
);

router.get(
  "/",
  auth("company_admin", "manager"),
  ShiftControllers.getCompanyShifts
);

router.patch(
  "/:id",
  auth("company_admin", "manager"),
  validateRequest(ShiftValidations.updateShiftSchema),
  ShiftControllers.updateShift
);

export const ShiftRoutes = router;
