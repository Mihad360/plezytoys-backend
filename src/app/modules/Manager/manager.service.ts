import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { UserModel } from "../User/user.model";
import { LocationModel } from "../Location/location.model";
import { WorkSessionModel } from "../WorkSession/workSession.model";
import { TaskModel } from "../Task/task.model";
import { ReportModel } from "../Report/report.model";
import { PatrolExecutionModel } from "../PatrolExecution/patrolExecution.model";
import { Types } from "mongoose";

// Helper: Determine location scope for a manager
const getManagerLocationIds = async (userId: string, companyId: string, requestedLocationId?: string): Promise<Types.ObjectId[]> => {
  if (requestedLocationId && requestedLocationId !== "all") {
    return [new Types.ObjectId(requestedLocationId)];
  }

  const manager = await UserModel.findById(userId);
  if (!manager) {
    throw new AppError(HttpStatus.NOT_FOUND, "Manager user not found");
  }

  // If manager has explicitly assigned locations
  if (manager.assignedLocations && manager.assignedLocations.length > 0) {
    return manager.assignedLocations.map(id => new Types.ObjectId(id.toString()));
  }

  if (manager.assignedLocation) {
    return [new Types.ObjectId(manager.assignedLocation.toString())];
  }

  // Fallback: all active locations for this company
  const companyLocations = await LocationModel.find({ company: companyId, isActive: true }).select("_id");
  return companyLocations.map(loc => loc._id as Types.ObjectId);
};

const getManagerDashboardStats = async (userId: string, companyId: string, requestedLocationId?: string) => {
  const locationIds = await getManagerLocationIds(userId, companyId, requestedLocationId);

  // 1. Core Counts
  const activeEmployees = await UserModel.countDocuments({
    company: companyId,
    role: "employee",
    status: "active",
    $or: [
      { assignedLocation: { $in: locationIds } },
      { assignedLocations: { $in: locationIds } }
    ]
  });

  const activePatrols = await PatrolExecutionModel.countDocuments({
    company: companyId,
    location: { $in: locationIds },
    status: "in_progress"
  });

  const tasksPending = await TaskModel.countDocuments({
    company: companyId,
    location: { $in: locationIds },
    status: { $in: ["assigned", "pending", "in_progress"] },
    isActive: true
  });

  const reportsToReview = await ReportModel.countDocuments({
    company: companyId,
    location: { $in: locationIds },
    status: { $in: ["submitted", "under_review", "open"] },
    isActive: true
  });

  // 2. Attention Required Items
  // A. GPS Anomalies
  const gpsAnomalies = await WorkSessionModel.find({
    company: companyId,
    location: { $in: locationIds },
    $or: [
      { "clockInLocation.isAnomaly": true },
      { "lastPingLocation.isAnomaly": true }
    ],
    status: "active"
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "firstName lastName name employeeId")
    .populate("location", "name");

  // B. Missed Checkpoints
  const missedCheckpoints = await PatrolExecutionModel.find({
    company: companyId,
    location: { $in: locationIds },
    "checkpoints.status": "missed"
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("executedBy", "firstName lastName name employeeId")
    .populate("location", "name")
    .populate("route", "name")
    .populate("checkpoints.checkpoint", "name code");

  // C. Overdue Tasks
  const now = new Date();
  const overdueTasks = await TaskModel.find({
    company: companyId,
    location: { $in: locationIds },
    $or: [
      { status: "overdue" },
      { dueDate: { $lt: now }, status: { $in: ["assigned", "pending", "in_progress"] } }
    ],
    isActive: true
  })
    .sort({ dueDate: 1 })
    .limit(5)
    .populate("assignedTo", "firstName lastName name employeeId")
    .populate("location", "name");

  // Format Attention Required alerts
  const attentionRequired: any[] = [];

  gpsAnomalies.forEach(session => {
    attentionRequired.push({
      type: "gps_anomaly",
      title: "GPS Anomaly",
      description: "Employee outside permitted zone",
      detail: `${(session.user as any)?.name || 'Employee'} · ${session.notes || 'Outside radius'}`,
      location: (session.location as any)?.name,
      severity: "high",
      targetId: session._id,
      timestamp: session.clockInTime
    });
  });

  missedCheckpoints.forEach(patrol => {
    const missed = patrol.checkpoints.filter(c => c.status === "missed");
    missed.forEach(m => {
      attentionRequired.push({
        type: "missed_checkpoint",
        title: "Missed Checkpoint",
        description: `${(patrol.route as any)?.name || 'Patrol'} - ${(patrol.location as any)?.name || 'Site'}`,
        detail: `Missed checkpoint: ${(m.checkpoint as any)?.name || 'Checkpoint'}${m.missedReason ? ` · Reason: ${m.missedReason}` : ""}`,
        location: (patrol.location as any)?.name,
        severity: "critical",
        targetId: patrol._id,
        timestamp: patrol.startTime
      });
    });
  });

  overdueTasks.forEach(task => {
    attentionRequired.push({
      type: "overdue_task",
      title: "Overdue Task",
      description: `${task.title} · ${(task.location as any)?.name || 'Site'}`,
      detail: `Assigned to: ${(task.assignedTo as any)?.name || 'Unassigned'}`,
      location: (task.location as any)?.name,
      severity: "medium",
      targetId: task._id,
      timestamp: task.dueDate
    });
  });

  // 3. Recent Activity Feed
  const recentSessions = await WorkSessionModel.find({ company: companyId, location: { $in: locationIds } })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("user", "name firstName lastName");

  const recentReports = await ReportModel.find({ company: companyId, location: { $in: locationIds } })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("author", "name firstName lastName");

  const recentPatrols = await PatrolExecutionModel.find({ company: companyId, location: { $in: locationIds }, status: "completed" })
    .sort({ endTime: -1 })
    .limit(3)
    .populate("executedBy", "name firstName lastName")
    .populate("route", "name");

  const recentActivity: any[] = [];

  recentSessions.forEach(s => {
    recentActivity.push({
      type: s.clockInLocation?.isAnomaly ? "gps_anomaly" : "clock_in",
      title: s.clockInLocation?.isAnomaly ? "GPS anomaly detected" : "Employee clocked in",
      user: (s.user as any)?.name || (s.user as any)?.firstName,
      timestamp: s.clockInTime,
      color: s.clockInLocation?.isAnomaly ? "orange" : "green"
    });
  });

  recentReports.forEach(r => {
    recentActivity.push({
      type: "report",
      title: `Report submitted: ${r.title}`,
      user: (r.author as any)?.name || (r.author as any)?.firstName,
      timestamp: r.createdAt,
      color: "purple"
    });
  });

  recentPatrols.forEach(p => {
    recentActivity.push({
      type: "patrol_completed",
      title: `Patrol completed: ${(p.route as any)?.name || 'Round'}`,
      user: (p.executedBy as any)?.name || (p.executedBy as any)?.firstName,
      timestamp: p.endTime || p.createdAt,
      color: "emerald"
    });
  });

  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    activeEmployees,
    activePatrols,
    tasksPending,
    reportsToReview,
    attentionRequired: attentionRequired.slice(0, 10),
    recentActivity: recentActivity.slice(0, 10)
  };
};

const getManagerLocations = async (userId: string, companyId: string) => {
  const manager = await UserModel.findById(userId);
  if (!manager) throw new AppError(HttpStatus.NOT_FOUND, "Manager not found");

  if (manager.assignedLocations && manager.assignedLocations.length > 0) {
    return await LocationModel.find({ _id: { $in: manager.assignedLocations }, isActive: true });
  }

  if (manager.assignedLocation) {
    return await LocationModel.find({ _id: manager.assignedLocation, isActive: true });
  }

  return await LocationModel.find({ company: companyId, isActive: true });
};

const getManagerEmployees = async (userId: string, companyId: string, requestedLocationId?: string) => {
  const locationIds = await getManagerLocationIds(userId, companyId, requestedLocationId);

  const employees = await UserModel.find({
    company: companyId,
    role: "employee",
    $or: [
      { assignedLocation: { $in: locationIds } },
      { assignedLocations: { $in: locationIds } }
    ]
  })
    .select("-password -pin -otp")
    .populate("assignedLocation", "name address radius coordinates");

  // Enhance each employee with live work status
  const employeesWithStatus = await Promise.all(
    employees.map(async emp => {
      const activeSession = await WorkSessionModel.findOne({ user: emp._id, status: "active" })
        .populate("location", "name");
      const currentTask = await TaskModel.findOne({ assignedTo: emp._id, status: "in_progress" })
        .select("title priority dueDate");

      return {
        ...emp.toObject(),
        isOnShift: Boolean(activeSession),
        activeSession: activeSession ? {
          sessionId: activeSession._id,
          clockInTime: activeSession.clockInTime,
          location: (activeSession.location as any)?.name,
          isVerified: activeSession.clockInLocation?.isVerified,
          isAnomaly: activeSession.clockInLocation?.isAnomaly,
          lastPingAt: activeSession.lastPingAt
        } : null,
        currentTask: currentTask || null
      };
    })
  );

  return employeesWithStatus;
};

const getManagerAlerts = async (userId: string, companyId: string, requestedLocationId?: string) => {
  const stats = await getManagerDashboardStats(userId, companyId, requestedLocationId);
  return stats.attentionRequired;
};

const getManagerAttendance = async (userId: string, companyId: string, requestedLocationId?: string) => {
  const locationIds = await getManagerLocationIds(userId, companyId, requestedLocationId);

  const sessions = await WorkSessionModel.find({
    company: companyId,
    location: { $in: locationIds }
  })
    .sort({ clockInTime: -1 })
    .populate("user", "firstName lastName name employeeId avatar")
    .populate("location", "name address coordinates radius");

  return sessions;
};

export const ManagerServices = {
  getManagerDashboardStats,
  getManagerLocations,
  getManagerEmployees,
  getManagerAlerts,
  getManagerAttendance
};
