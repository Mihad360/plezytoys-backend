import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TaskServices } from "./task.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createTask = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await TaskServices.createTaskIntoDB(user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const getAllTasks = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const assignedTo = req.query.assignedTo as string;
  const locationId = req.query.locationId as string;
  const status = req.query.status as string;
  
  // If employee, only see their own tasks
  const finalAssignedTo = user.role === "employee" ? user.user.toString() : assignedTo;

  const result = await TaskServices.getAllTasksFromDB(userDoc.company.toString(), finalAssignedTo, locationId, status);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Tasks retrieved successfully",
    data: result,
  });
});

const getTaskById = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const id = req.params.id as string;
  const result = await TaskServices.getTaskByIdFromDB(id, userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Task retrieved successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "Company association required");
  }

  const id = req.params.id as string;
  const result = await TaskServices.updateTaskInDB(id, userDoc.company.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const submitTask = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const result = await TaskServices.submitTaskForReview(id, user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Task submitted for review successfully",
    data: result,
  });
});

const reviewTask = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const id = req.params.id as string;
  const result = await TaskServices.reviewTaskInDB(id, user.user.toString(), req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: `Task ${req.body.status} successfully`,
    data: result,
  });
});

const toggleChecklistItem = catchAsync(async (req, res) => {
  const { id, itemId } = req.params;
  const { isCompleted } = req.body;
  const result = await TaskServices.toggleChecklistItemInDB(id as string, itemId as string, Boolean(isCompleted));

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Checklist item updated",
    data: result,
  });
});

export const TaskControllers = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  submitTask,
  reviewTask,
  toggleChecklistItem,
};
