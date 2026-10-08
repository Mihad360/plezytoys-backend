import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { DocumentControllers } from "./document.controller";
import { DocumentValidations } from "./document.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth("company_admin", "manager"),
  validateRequest(DocumentValidations.createDocumentSchema),
  DocumentControllers.createDocument
);

router.get(
  "/me",
  auth("employee", "manager"),
  DocumentControllers.getMyDocuments
);

router.get(
  "/",
  auth("company_admin", "manager"),
  DocumentControllers.getCompanyDocuments
);

export const DocumentRoutes = router;
