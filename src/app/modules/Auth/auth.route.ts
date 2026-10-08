import express from "express";
import { authControllers } from "./auth.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/create", authControllers.createUser);
router.post("/login", authControllers.loginUser);
router.post("/login-pin", authControllers.loginWithPin);
router.post("/verify-otp", authControllers.verifyOtp);
router.post("/resend-otp/:email", authControllers.resendOtp);
router.post("/forget-password", authControllers.forgetPassword);
router.post(
  "/reset-password",
  auth("admin", "user", "super_admin", "company_admin", "manager", "employee"),
  authControllers.resetPassword,
);
router.post(
  "/change-password",
  auth("admin", "user", "super_admin", "company_admin", "manager", "employee"),
  authControllers.changePassword,
);
router.post("/refresh-token", authControllers.refreshToken);

router.post(
  "/set-pin",
  auth("admin", "user", "super_admin", "company_admin", "manager", "employee"),
  authControllers.setPin
);

router.patch(
  "/security-settings",
  auth("admin", "user", "super_admin", "company_admin", "manager", "employee"),
  authControllers.updateSecuritySettings
);

export const AuthRoutes = router;
