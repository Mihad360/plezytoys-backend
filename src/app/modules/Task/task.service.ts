import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { TaskModel } from "./task.model";
import { UserModel } from "../User/user.model";
import { ITask } from "./task.interface";
import { sendNotification, sendNotificationToCompanyRoles } from "../Notification/notification.utils";

const createTaskIntoDB = async (userId: string, payload: Partial<ITask>) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "User or company not found");
  }

  const newTask = await TaskModel.create({
    ...payload,
    createdBy: userId,
    company: user.company,
  });
  
  if (newTask.assignedTo) {
    await sendNotification({
      recipientId: newTask.assignedTo.toString(),
      senderId: userId,
      type: "task",
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${newTask.title}`,
      data: { taskId: newTask._id.toString() }
    });
  }
  
  return newTask;
};

const getAllTasksFromDB = async (companyId: string, assignedTo?: string, locationId?: string, status?: string) => {
  const query: any = { company: companyId, isActive: true };
  if (assignedTo) query.assignedTo = assignedTo;
  if (locationId) query.location = locationId;
  if (status) query.status = status;
  
  return await TaskModel.find(query)
    .sort({ createdAt: -1 })
    .populate("assignedTo", "firstName lastName email employeeId avatar")
    .populate("createdBy", "firstName lastName email")
    .populate("reviewedBy", "firstName lastName email")
    .populate("location", "name address");
};

const getTaskByIdFromDB = async (id: string, companyId: string) => {
  const task = await TaskModel.findOne({ _id: id, company: companyId })
    .populate("assignedTo", "firstName lastName email employeeId avatar")
    .populate("createdBy", "firstName lastName email")
    .populate("reviewedBy", "firstName lastName email")
    .populate("location", "name address");
    
  if (!task) {
    throw new AppError(HttpStatus.NOT_FOUND, "Task not found");
  }
  return task;
};

const updateTaskInDB = async (id: string, companyId: string, payload: Partial<ITask>) => {
  const task = await TaskModel.findOne({ _id: id, company: companyId });
  if (!task) {
    throw new AppError(HttpStatus.NOT_FOUND, "Task not found");
  }

  if (payload.status === "completed" && task.status !== "completed") {
    if (task.requiresEvidence && (!payload.attachments || payload.attachments.length === 0) && (!task.attachments || task.attachments.length === 0)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Evidence is required to complete this task");
    }
    payload.completedAt = new Date();
    
    if (task.createdBy.toString() !== task.assignedTo?.toString()) {
      await sendNotification({
        recipientId: task.createdBy.toString(),
        type: "task",
        title: "Task Completed",
        message: `Task "${task.title}" has been completed.`,
        data: { taskId: task._id.toString() }
      });
    }
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return updatedTask;
};

const submitTaskForReview = async (id: string, userId: string, payload: { attachments?: any[]; completionNotes?: string }) => {
  const task = await TaskModel.findById(id);
  if (!task) {
    throw new AppError(HttpStatus.NOT_FOUND, "Task not found");
  }

  // Check mandatory checklist items
  if (task.checklist && task.checklist.length > 0) {
    const uncompletedMandatory = task.checklist.filter(c => c.isMandatory && !c.isCompleted);
    if (uncompletedMandatory.length > 0) {
      throw new AppError(HttpStatus.BAD_REQUEST, `Please complete all mandatory checklist items before submitting: ${uncompletedMandatory.map(c => c.text).join(", ")}`);
    }
  }

  if (task.requiresEvidence && (!payload.attachments || payload.attachments.length === 0) && (!task.attachments || task.attachments.length === 0)) {
    throw new AppError(HttpStatus.BAD_REQUEST, "Required photo or file evidence must be attached");
  }

  task.status = "submitted";
  task.completedAt = new Date();
  if (payload.attachments) task.attachments = payload.attachments;
  if (payload.completionNotes) task.completionNotes = payload.completionNotes;

  await task.save();

  // Notify creator / managers / company admins
  if (task.createdBy) {
    await sendNotification({
      recipientId: task.createdBy.toString(),
      senderId: userId,
      type: "task",
      title: "Task Submitted for Review",
      message: `Task "${task.title}" has been submitted for review.`,
      data: { taskId: task._id.toString() }
    });
  }

  if (task.company) {
    await sendNotificationToCompanyRoles({
      companyId: task.company.toString(),
      roles: ["manager", "company_admin"],
      type: "task",
      title: "Task Submitted for Review",
      message: `Task "${task.title}" has been submitted for review.`,
      data: { taskId: task._id.toString() },
      senderId: userId,
    });
  }

  return task;
};

const reviewTaskInDB = async (id: string, reviewerId: string, payload: { status: "approved" | "rejected" | "returned"; reviewNotes?: string }) => {
  const task = await TaskModel.findById(id);
  if (!task) {
    throw new AppError(HttpStatus.NOT_FOUND, "Task not found");
  }

  task.status = payload.status;
  task.reviewedBy = reviewerId as any;
  task.reviewedAt = new Date();
  if (payload.reviewNotes) task.reviewNotes = payload.reviewNotes;

  await task.save();

  // Notify employee of review outcome
  if (task.assignedTo) {
    const statusTitles = {
      approved: "Task Approved",
      rejected: "Task Rejected",
      returned: "Task Returned for Revision"
    };
    await sendNotification({
      recipientId: task.assignedTo.toString(),
      senderId: reviewerId,
      type: "task",
      title: statusTitles[payload.status],
      message: `Your task "${task.title}" was ${payload.status}.${payload.reviewNotes ? ` Note: ${payload.reviewNotes}` : ""}`,
      data: { taskId: task._id.toString() }
    });
  }

  return task;
};

const toggleChecklistItemInDB = async (taskId: string, itemId: string, isCompleted: boolean) => {
  const task = await TaskModel.findById(taskId);
  if (!task) {
    throw new AppError(HttpStatus.NOT_FOUND, "Task not found");
  }

  const item = task.checklist?.find(c => c._id?.toString() === itemId);
  if (!item) {
    throw new AppError(HttpStatus.NOT_FOUND, "Checklist item not found");
  }

  item.isCompleted = isCompleted;
  
  if (task.status === "assigned") {
    task.status = "in_progress";
  }

  await task.save();
  return task;
};

export const TaskServices = {
  createTaskIntoDB,
  getAllTasksFromDB,
  getTaskByIdFromDB,
  updateTaskInDB,
  submitTaskForReview,
  reviewTaskInDB,
  toggleChecklistItemInDB
};
