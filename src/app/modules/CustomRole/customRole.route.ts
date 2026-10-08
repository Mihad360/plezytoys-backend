import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { CustomRoleControllers } from "./customRole.controller";
import { CustomRoleValidations } from "./customRole.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin"),
  validateRequest(CustomRoleValidations.createCustomRoleSchema),
  CustomRoleControllers.createRole
);

router.get(
  "/",
  auth("company_admin"),
  CustomRoleControllers.getRoles
);

router.patch(
  "/:id",
  auth("company_admin"),
  validateRequest(CustomRoleValidations.updateCustomRoleSchema),
  CustomRoleControllers.updateRole
);

router.post(
  "/assign",
  auth("company_admin"),
  CustomRoleControllers.assignRole
);

export const CustomRoleRoutes = router;
