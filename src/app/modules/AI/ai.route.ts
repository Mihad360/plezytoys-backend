import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AIControllers } from "./ai.controller";
import { AIValidations } from "./ai.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/knowledge-sources",
  auth("company_admin"),
  validateRequest(AIValidations.addKnowledgeSourceSchema),
  AIControllers.addKnowledgeSource
);

router.get(
  "/knowledge-sources",
  auth("company_admin", "manager"),
  AIControllers.getKnowledgeSources
);

router.post(
  "/ask",
  auth("employee", "manager"),
  validateRequest(AIValidations.askQuestionSchema),
  AIControllers.askQuestion
);

router.get(
  "/unresolved-questions",
  auth("company_admin"),
  AIControllers.getUnresolvedQuestions
);

router.patch(
  "/unresolved-questions/:id",
  auth("company_admin"),
  validateRequest(AIValidations.updateUnresolvedQuestionSchema),
  AIControllers.updateUnresolvedQuestion
);

export const AIRoutes = router;
