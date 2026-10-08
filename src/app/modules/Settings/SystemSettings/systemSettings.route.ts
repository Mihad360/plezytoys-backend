import express from "express";
import { SystemSettingsControllers } from "./systemSettings.controller";
import auth from "../../../middlewares/auth";
import { uploadImage } from "../../../utils/sendImageToCloudinary";

const router = express.Router();

router.get(
  "/",
  auth("super_admin"),
  SystemSettingsControllers.getSettings
);

router.patch(
  "/",
  auth("super_admin"),
  uploadImage.single("image"),
  (req, res, next) => {
    if (req.body.data && typeof req.body.data === "string") {
      try {
        req.body = JSON.parse(req.body.data);
      } catch {
        // fallback
      }
    }
    next();
  },
  SystemSettingsControllers.updateSettings
);

// Allow public/auth users to get general platform info (platform name, default currency, etc.)
router.get(
  "/public",
  SystemSettingsControllers.getSettings
);

export const SystemSettingsRoutes = router;
