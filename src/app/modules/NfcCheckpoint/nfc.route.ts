import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { NfcControllers } from "./nfc.controller";
import { NfcValidations } from "./nfc.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("super_admin", "company_admin", "manager"),
  validateRequest(NfcValidations.createNfcCheckpointSchema),
  NfcControllers.createNfc
);

router.get(
  "/",
  auth("super_admin", "company_admin", "manager", "employee"),
  NfcControllers.getAllNfcs
);

router.get(
  "/:id",
  auth("super_admin", "company_admin", "manager", "employee"),
  NfcControllers.getNfcById
);

router.patch(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  validateRequest(NfcValidations.updateNfcCheckpointSchema),
  NfcControllers.updateNfc
);

router.delete(
  "/:id",
  auth("super_admin", "company_admin", "manager"),
  NfcControllers.deleteNfc
);

export const NfcRoutes = router;
