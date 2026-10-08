import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { PatrolExecutionModel } from "./patrolExecution.model";
import { PatrolRouteModel } from "../PatrolRoute/patrolRoute.model";
import { UserModel } from "../User/user.model";
import { NfcCheckpointModel } from "../NfcCheckpoint/nfc.model";
import { sendNotification, sendNotificationToCompanyRoles } from "../Notification/notification.utils";

const startExecutionInDB = async (userId: string, payload: any) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "User or company not found");
  }

  // Prevent starting if already running one
  const activeExec = await PatrolExecutionModel.findOne({ executedBy: userId, status: "in_progress" });
  if (activeExec) {
    throw new AppError(HttpStatus.CONFLICT, "User already has an active patrol execution");
  }

  const route = await PatrolRouteModel.findById(payload.routeId);
  if (!route) {
    throw new AppError(HttpStatus.NOT_FOUND, "Patrol Route not found");
  }

  // Build the execution checkpoints from the route template
  const executionCheckpoints = route.checkpoints.map(cp => ({
    checkpoint: cp.checkpoint,
    status: "pending" as const,
  }));

  const newExec = await PatrolExecutionModel.create({
    route: payload.routeId,
    executedBy: userId,
    company: user.company,
    location: payload.locationId || route.location,
    startTime: new Date(),
    status: "in_progress",
    checkpoints: executionCheckpoints
  });
  
  return newExec;
};

const getMyActiveExecutionFromDB = async (userId: string) => {
  const activeExec = await PatrolExecutionModel.findOne({ executedBy: userId, status: "in_progress" })
    .populate("route", "name estimatedDurationMinutes checkpoints")
    .populate("location", "name address")
    .populate("checkpoints.checkpoint", "name code type coordinates order");
  return activeExec;
};

const scanCheckpointInDB = async (userId: string, execId: string, payload: any) => {
  const exec = await PatrolExecutionModel.findOne({ _id: execId, executedBy: userId, status: "in_progress" });
  if (!exec) {
    throw new AppError(HttpStatus.NOT_FOUND, "Active execution not found");
  }

  const cpIndex = exec.checkpoints.findIndex(c => c.checkpoint.toString() === payload.checkpointId);
  if (cpIndex === -1) {
    throw new AppError(HttpStatus.BAD_REQUEST, "Checkpoint not part of this route");
  }

  if (exec.checkpoints[cpIndex].status === "scanned") {
    throw new AppError(HttpStatus.BAD_REQUEST, "Checkpoint already scanned");
  }

  exec.checkpoints[cpIndex].status = "scanned";
  exec.checkpoints[cpIndex].scannedAt = new Date();
  if (payload.notes) exec.checkpoints[cpIndex].notes = payload.notes;
  if (payload.photoUrl) exec.checkpoints[cpIndex].photoUrl = payload.photoUrl;
  if (payload.verificationData) exec.checkpoints[cpIndex].verificationData = payload.verificationData;

  // Auto-complete if all are scanned
  const allScanned = exec.checkpoints.every(c => c.status === "scanned");
  if (allScanned) {
    exec.status = "completed";
    exec.endTime = new Date();
  }

  await exec.save();
  
  // Update the actual NFC Checkpoint lastScanned data
  await NfcCheckpointModel.findByIdAndUpdate(payload.checkpointId, {
    lastScannedAt: new Date(),
    lastScannedBy: userId
  });

  return exec;
};

const recordMissedCheckpointInDB = async (userId: string, execId: string, payload: { checkpointId: string; missedReason: string }) => {
  const exec = await PatrolExecutionModel.findOne({ _id: execId, executedBy: userId, status: "in_progress" });
  if (!exec) {
    throw new AppError(HttpStatus.NOT_FOUND, "Active execution not found");
  }

  const cp = exec.checkpoints.find(c => c.checkpoint.toString() === payload.checkpointId);
  if (!cp) {
    throw new AppError(HttpStatus.BAD_REQUEST, "Checkpoint not part of this route");
  }

  cp.status = "missed";
  cp.missedReason = payload.missedReason;

  await exec.save();

  // Notify manager and company admin of missed checkpoint alert
  const user = await UserModel.findById(userId);
  const checkpointDoc = await NfcCheckpointModel.findById(payload.checkpointId);
  const cpName = checkpointDoc?.name || "Checkpoint";

  if (user?.assignedManager) {
    await sendNotification({
      recipientId: user.assignedManager.toString(),
      senderId: userId,
      type: "patrol",
      title: "Checkpoint Missed",
      message: `${user.name || user.firstName} missed checkpoint "${cpName}" during patrol. Reason: ${payload.missedReason}`,
      data: {
        executionId: exec._id.toString(),
        checkpointId: payload.checkpointId,
        alertType: "missed_checkpoint",
      },
    });
  }

  if (user?.company) {
    await sendNotificationToCompanyRoles({
      companyId: user.company.toString(),
      roles: ["manager", "company_admin"],
      type: "patrol",
      title: "Checkpoint Missed",
      message: `${user.name || user.firstName} missed checkpoint "${cpName}" during patrol. Reason: ${payload.missedReason}`,
      data: {
        executionId: exec._id.toString(),
        checkpointId: payload.checkpointId,
        alertType: "missed_checkpoint",
      },
      senderId: userId,
    });
  }

  return exec;
};

const finishExecutionInDB = async (userId: string, execId: string, payload: any) => {
  const exec = await PatrolExecutionModel.findOne({ _id: execId, executedBy: userId, status: "in_progress" });
  if (!exec) {
    throw new AppError(HttpStatus.NOT_FOUND, "Active execution not found");
  }

  const hasPending = exec.checkpoints.some(c => c.status === "pending");
  
  exec.status = payload.status || (hasPending ? "incomplete" : "completed");
  exec.endTime = new Date();
  if (payload.notes) exec.notes = payload.notes;

  // Mark pendings as missed if not completed
  exec.checkpoints.forEach(c => {
    if (c.status === "pending") c.status = "missed";
  });

  await exec.save();

  // Notify manager and company admin of patrol completion
  const user = await UserModel.findById(userId);
  if (user?.company) {
    await sendNotificationToCompanyRoles({
      companyId: user.company.toString(),
      roles: ["manager", "company_admin"],
      type: "patrol",
      title: exec.status === "completed" ? "Patrol Completed" : "Patrol Finished (Incomplete)",
      message: `${user.name || user.firstName || 'Guard'} finished patrol run with status: ${exec.status}.`,
      data: { executionId: exec._id.toString(), status: exec.status },
      senderId: userId,
    });
  }

  return exec;
};

const getAllExecutionsFromDB = async (companyId: string, locationId?: string, executedBy?: string, status?: string) => {
  const query: any = { company: companyId };
  if (locationId) query.location = locationId;
  if (executedBy) query.executedBy = executedBy;
  if (status) query.status = status;
  
  return await PatrolExecutionModel.find(query)
    .sort({ createdAt: -1 })
    .populate("executedBy", "firstName lastName email employeeId avatar")
    .populate("route", "name")
    .populate("location", "name address")
    .populate("checkpoints.checkpoint", "name code type");
};

const getExecutionByIdFromDB = async (id: string, companyId?: string) => {
  const query: any = { _id: id };
  if (companyId) query.company = companyId;

  const execution = await PatrolExecutionModel.findOne(query)
    .populate("executedBy", "firstName lastName email employeeId avatar")
    .populate("route", "name estimatedDurationMinutes checkpoints")
    .populate("location", "name address")
    .populate("checkpoints.checkpoint", "name code type placementDescription coordinates");

  if (!execution) {
    throw new AppError(HttpStatus.NOT_FOUND, "Patrol execution not found");
  }
  return execution;
};

export const PatrolExecutionServices = {
  startExecutionInDB,
  getMyActiveExecutionFromDB,
  scanCheckpointInDB,
  recordMissedCheckpointInDB,
  finishExecutionInDB,
  getAllExecutionsFromDB,
  getExecutionByIdFromDB,
};
