import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { DeviceControllers } from "./device.controller";
import { DeviceValidations } from "./device.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/register",
  auth("employee", "manager"),
  validateRequest(DeviceValidations.registerDeviceSchema),
  DeviceControllers.registerDevice
);

router.get(
  "/me",
  auth("employee", "manager"),
  DeviceControllers.getMyDevices
);

router.get(
  "/",
  auth("company_admin", "manager"),
  DeviceControllers.getCompanyDevices
);

router.patch(
  "/:id",
  auth("company_admin", "manager"),
  validateRequest(DeviceValidations.updateDeviceStatusSchema),
  DeviceControllers.updateDevice
);

export const DeviceRoutes = router;
