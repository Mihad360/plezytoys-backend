import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { LocationControllers } from "./location.controller";
import { LocationValidations } from "./location.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin", "company_admin", "manager"),
  validateRequest(LocationValidations.createLocationSchema),
  LocationControllers.createLocation
);

router.get(
  "/",
  auth("super_admin", "company_admin", "manager", "employee"),
  LocationControllers.getAllLocations
);

router.get(
  "/:id",
  auth("super_admin", "company_admin", "manager", "employee"),
  LocationControllers.getLocationById
);

router.patch(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  validateRequest(LocationValidations.updateLocationSchema),
  LocationControllers.updateLocation
);

router.delete(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  LocationControllers.deleteLocation
);

export const LocationRoutes = router;
