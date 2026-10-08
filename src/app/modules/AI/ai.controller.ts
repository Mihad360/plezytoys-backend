import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AIServices } from "./ai.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const addKnowledgeSource = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company required");

  const result = await AIServices.addKnowledgeSource(userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Knowledge source added", data: result });
});

const getKnowledgeSources = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company required");

  const result = await AIServices.getKnowledgeSources(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Knowledge sources retrieved", data: result });
});

const askQuestion = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company required");

  const result = await AIServices.askQuestion(userDoc.company.toString(), user.user.toString(), req.body.question);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Question submitted", data: result });
});

const getUnresolvedQuestions = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company required");

  const result = await AIServices.getUnresolvedQuestions(userDoc.company.toString());
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Unresolved questions retrieved", data: result });
});

const updateUnresolvedQuestion = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company required");

  const id = req.params.id as string;
  const result = await AIServices.updateUnresolvedQuestion(id, userDoc.company.toString(), req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Question updated", data: result });
});

export const AIControllers = {
  addKnowledgeSource,
  getKnowledgeSources,
  askQuestion,
  getUnresolvedQuestions,
  updateUnresolvedQuestion
};
