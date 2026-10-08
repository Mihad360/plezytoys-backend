import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { KnowledgeSourceModel, UnresolvedQuestionModel } from "./ai.model";
import { IKnowledgeSource, IUnresolvedQuestion } from "./ai.interface";

const addKnowledgeSource = async (companyId: string, payload: Partial<IKnowledgeSource>) => {
  return await KnowledgeSourceModel.create({
    ...payload,
    company: companyId
  });
};

const getKnowledgeSources = async (companyId: string) => {
  return await KnowledgeSourceModel.find({ company: companyId, isActive: true });
};

const askQuestion = async (companyId: string, userId: string, question: string) => {
  // Placeholder for AI logic. For now we just log it as an unresolved question to be handled by Company Admin
  return await UnresolvedQuestionModel.create({
    company: companyId,
    user: userId,
    question,
    status: "unresolved"
  });
};

const getUnresolvedQuestions = async (companyId: string) => {
  return await UnresolvedQuestionModel.find({ company: companyId })
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 });
};

const updateUnresolvedQuestion = async (id: string, companyId: string, payload: Partial<IUnresolvedQuestion>) => {
  const q = await UnresolvedQuestionModel.findOne({ _id: id, company: companyId });
  if (!q) throw new AppError(HttpStatus.NOT_FOUND, "Question not found");
  
  return await UnresolvedQuestionModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

export const AIServices = {
  addKnowledgeSource,
  getKnowledgeSources,
  askQuestion,
  getUnresolvedQuestions,
  updateUnresolvedQuestion
};
