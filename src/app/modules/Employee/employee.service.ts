import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { UserModel } from "../User/user.model";
import { LocationModel } from "../Location/location.model";
import { WorkSessionModel } from "../WorkSession/workSession.model";
import { TaskModel } from "../Task/task.model";
import { ReportModel } from "../Report/report.model";
import { PatrolExecutionModel } from "../PatrolExecution/patrolExecution.model";
import { PatrolRouteModel } from "../PatrolRoute/patrolRoute.model";
import { ShiftModel } from "../Shift/shift.model";
import { AnnouncementModel } from "../Announcement/announcement.model";
import { NotificationModel } from "../Notification/notification.model";
import { PatrolExecutionServices } from "../PatrolExecution/patrolExecution.service";
import { TaskServices } from "../Task/task.service";
import { ReportServices } from "../Report/report.service";
import { WorkSessionServices } from "../WorkSession/workSession.service";
import { Types } from "mongoose";

const getEmployeeAuthorizedLocations = async (userId: string, companyId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(HttpStatus.NOT_FOUND, "Employee not found");

  if (user.assignedLocations && user.assignedLocations.length > 0) {
    return await LocationModel.find({ _id: { $in: user.assignedLocations }, isActive: true })
      .populate("customer", "companyName customerId");
  }

  if (user.assignedLocation) {
    return await LocationModel.find({ _id: user.assignedLocation, isActive: true })
      .populate("customer", "companyName customerId");
  }

  return await LocationModel.find({ company: companyId, isActive: true })
    .populate("customer", "companyName customerId");
};

const getEmployeeHomeSummary = async (userId: string, companyId: string) => {
  const user = await UserModel.findById(userId)
    .populate("assignedManager", "name firstName lastName email phone")
    .populate("assignedCustomer", "companyName customerId")
    .populate("assignedLocation", "name address radius coordinates");

  if (!user) throw new AppError(HttpStatus.NOT_FOUND, "User not found");

  const authorizedLocations = await getEmployeeAuthorizedLocations(userId, companyId);
  const locationIds = authorizedLocations.map(l => l._id as Types.ObjectId);

  // 1. Work Session Status (Clocked in?)
  const activeSession = await WorkSessionModel.findOne({ user: userId, status: "active" })
    .populate("location", "name address radius coordinates");

  const isClockedIn = Boolean(activeSession);
  const now = new Date();

  let sessionData = null;
  if (activeSession) {
    const elapsedMinutes = Math.floor((now.getTime() - activeSession.clockInTime.getTime()) / 60000);
    sessionData = {
      sessionId: activeSession._id,
      clockInTime: activeSession.clockInTime,
      elapsedMinutes,
      elapsedFormatted: `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`,
      location: activeSession.location,
      clockInLocation: activeSession.clockInLocation,
      isVerified: activeSession.clockInLocation?.isVerified ?? true,
      isAnomaly: activeSession.clockInLocation?.isAnomaly ?? false,
      accuracy: activeSession.clockInLocation?.accuracy ?? 10
    };
  }

  // 2. Today's Scheduled Shift
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayShift = await ShiftModel.findOne({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate("location", "name address")
    .populate("manager", "name firstName lastName")
    .populate("customer", "companyName");

  // 3. Counts
  const assignedLocationsCount = authorizedLocations.length;

  const activePatrolsCount = await PatrolExecutionModel.countDocuments({
    executedBy: userId,
    status: { $in: ["in_progress"] }
  });

  const upcomingPatrolsCount = await PatrolRouteModel.countDocuments({
    location: { $in: locationIds },
    isActive: true
  });

  const tasksCount = await TaskModel.countDocuments({
    assignedTo: userId,
    status: { $in: ["assigned", "pending", "in_progress", "returned"] },
    isActive: true
  });

  const reportsCount = await ReportModel.countDocuments({
    $or: [
      { author: userId },
      { location: { $in: locationIds } }
    ],
    isActive: true
  });

  const unreadAnnouncementsCount = await AnnouncementModel.countDocuments({
    company: companyId,
    isActive: true,
    "readBy.user": { $ne: new Types.ObjectId(userId) }
  });

  const unreadNotificationsCount = await NotificationModel.countDocuments({
    recipient: userId,
    isRead: false
  });

  // 4. Action Required (Overdue or Due Soon Tasks)
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const actionRequiredTask = await TaskModel.findOne({
    assignedTo: userId,
    status: { $in: ["assigned", "in_progress", "overdue", "returned"] },
    $or: [
      { status: "overdue" },
      { status: "returned" },
      { dueDate: { $lte: twoHoursFromNow } }
    ],
    isActive: true
  }).sort({ dueDate: 1 });

  // 5. Next Up Items (Scheduled tasks and patrols)
  const nextTasks = await TaskModel.find({
    assignedTo: userId,
    status: { $in: ["assigned", "in_progress"] },
    isActive: true
  })
    .sort({ dueDate: 1 })
    .limit(2)
    .populate("location", "name");

  const nextPatrols = await PatrolRouteModel.find({
    location: { $in: locationIds },
    isActive: true
  })
    .limit(2)
    .populate("location", "name");

  const nextUp: any[] = [];
  nextTasks.forEach(t => {
    nextUp.push({
      id: t._id,
      type: "task",
      title: t.title,
      time: t.dueDate,
      location: (t.location as any)?.name,
      priority: t.priority,
      status: t.status,
    });
  });

  nextPatrols.forEach(p => {
    nextUp.push({
      id: p._id,
      type: "patrol",
      title: p.name,
      checkpointsCount: p.checkpoints.length,
      estimatedMinutes: p.estimatedDurationMinutes,
      location: (p.location as any)?.name,
      status: "upcoming"
    });
  });

  // 6. Authorized locations with active patrols count
  const locationsWithCounts = await Promise.all(
    authorizedLocations.map(async loc => {
      const activePatrols = await PatrolExecutionModel.countDocuments({
        location: loc._id,
        status: "in_progress"
      });
      return {
        _id: loc._id,
        locationId: loc.locationId,
        name: loc.name,
        address: loc.address,
        customer: loc.customer,
        coordinates: loc.coordinates,
        radius: loc.radius,
        timezone: loc.timezone,
        activePatrolsCount: activePatrols,
        isActive: loc.isActive
      };
    })
  );

  // 7. Recent Reports
  const recentReports = await ReportModel.find({
    $or: [
      { author: userId },
      { location: { $in: locationIds } }
    ],
    isActive: true
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("location", "name");

  return {
    employee: {
      _id: user._id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      initials: user.initials || `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
      email: user.email,
      phone: user.phone,
      employeeId: user.employeeId,
      avatar: user.avatar,
      manager: user.assignedManager,
      customer: user.assignedCustomer,
      location: user.assignedLocation
    },
    workStatus: {
      isClockedIn,
      activeSession: sessionData
    },
    todayShift: todayShift ? {
      _id: todayShift._id,
      date: todayShift.date,
      startTime: todayShift.startTime,
      endTime: todayShift.endTime,
      location: todayShift.location,
      manager: todayShift.manager,
      customer: todayShift.customer,
      status: todayShift.status,
    } : null,
    counts: {
      assignedLocationsCount,
      activePatrolsCount,
      upcomingPatrolsCount,
      tasksCount,
      reportsCount,
      unreadAnnouncementsCount,
      unreadNotificationsCount
    },
    actionRequired: actionRequiredTask ? {
      taskId: actionRequiredTask._id,
      title: actionRequiredTask.title,
      status: actionRequiredTask.status,
      dueDate: actionRequiredTask.dueDate,
      message: actionRequiredTask.status === "returned" 
        ? "Task returned for revision"
        : actionRequiredTask.status === "overdue"
        ? "1 task is overdue"
        : "1 task is due soon"
    } : null,
    nextUp,
    assignedLocations: locationsWithCounts,
    recentReports
  };
};

const getEmployeeOperationalHistory = async (userId: string, filter?: string) => {
  const history: any[] = [];

  // Completed Patrols
  if (!filter || filter === "all" || filter === "rounds") {
    const patrols = await PatrolExecutionModel.find({ executedBy: userId, status: "completed" })
      .sort({ endTime: -1 })
      .limit(10)
      .populate("route", "name")
      .populate("location", "name");

    patrols.forEach(p => {
      history.push({
        id: p._id,
        type: "patrol",
        category: "rounds",
        title: "Patrol completed",
        detail: (p.route as any)?.name || "Security Patrol",
        location: (p.location as any)?.name,
        timestamp: p.endTime || p.createdAt,
      });
    });
  }

  // Completed Tasks
  if (!filter || filter === "all" || filter === "tasks") {
    const tasks = await TaskModel.find({ assignedTo: userId, status: { $in: ["completed", "approved", "submitted"] } })
      .sort({ completedAt: -1 })
      .limit(10)
      .populate("location", "name");

    tasks.forEach(t => {
      history.push({
        id: t._id,
        type: "task",
        category: "tasks",
        title: t.status === "approved" ? "Task approved" : "Task completed",
        detail: t.title,
        location: (t.location as any)?.name,
        timestamp: t.completedAt || t.updatedAt,
      });
    });
  }

  // Submitted Reports
  if (!filter || filter === "all" || filter === "reports") {
    const reports = await ReportModel.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("location", "name");

    reports.forEach(r => {
      history.push({
        id: r._id,
        type: "report",
        category: "reports",
        title: "Report submitted",
        detail: `${r.reportId ? `#${r.reportId} · ` : ""}${r.title}`,
        location: (r.location as any)?.name,
        status: r.status,
        timestamp: r.createdAt,
      });
    });
  }

  // Completed Work Sessions
  if (!filter || filter === "all" || filter === "work_sessions") {
    const sessions = await WorkSessionModel.find({ user: userId, status: "completed" })
      .sort({ clockOutTime: -1 })
      .limit(10)
      .populate("location", "name");

    sessions.forEach(s => {
      const durationFormatted = s.durationMinutes 
        ? `${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m`
        : "Recorded";

      history.push({
        id: s._id,
        type: "work_session",
        category: "work_sessions",
        title: "Work session completed",
        detail: `${durationFormatted}`,
        location: (s.location as any)?.name,
        timestamp: s.clockOutTime || s.createdAt,
      });
    });
  }

  // Sort unified history by timestamp descending
  history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return history;
};

const batchOfflineSync = async (userId: string, companyId: string, items: any[]) => {
  const syncResults: any[] = [];

  for (const item of items) {
    try {
      if (item.type === "nfc_scan") {
        const { executionId, checkpointId, notes, photoUrl, verificationData } = item.payload;
        const res = await PatrolExecutionServices.scanCheckpointInDB(userId, executionId, {
          checkpointId,
          notes,
          photoUrl,
          verificationData
        });
        syncResults.push({ id: item.id, status: "completed", data: res });
      } else if (item.type === "checklist_toggle") {
        const { taskId, itemId, isCompleted } = item.payload;
        const res = await TaskServices.toggleChecklistItemInDB(taskId, itemId, isCompleted);
        syncResults.push({ id: item.id, status: "completed", data: res });
      } else if (item.type === "task_submit") {
        const { taskId, attachments, completionNotes } = item.payload;
        const res = await TaskServices.submitTaskForReview(taskId, userId, { attachments, completionNotes });
        syncResults.push({ id: item.id, status: "completed", data: res });
      } else if (item.type === "report_create") {
        const res = await ReportServices.createReportIntoDB(userId, item.payload);
        syncResults.push({ id: item.id, status: "completed", data: res });
      } else if (item.type === "clock_in") {
        const res = await WorkSessionServices.clockInIntoDB(userId, item.payload);
        syncResults.push({ id: item.id, status: "completed", data: res });
      } else if (item.type === "clock_out") {
        const res = await WorkSessionServices.clockOutInDB(userId, item.payload);
        syncResults.push({ id: item.id, status: "completed", data: res });
      } else {
        syncResults.push({ id: item.id, status: "failed", error: "Unknown action type" });
      }
    } catch (err: any) {
      const isDuplicate = err.message?.includes("already scanned") || err.message?.includes("already clocked in");
      syncResults.push({
        id: item.id,
        status: isDuplicate ? "duplicate" : "failed",
        error: err.message
      });
    }
  }

  return {
    totalSynced: syncResults.filter(r => r.status === "completed").length,
    totalFailed: syncResults.filter(r => r.status === "failed").length,
    totalDuplicates: syncResults.filter(r => r.status === "duplicate").length,
    results: syncResults
  };
};

const getNextEmployeeIdToDB = async (companyId?: string) => {
  const query: any = { role: "employee" };
  if (companyId) {
    query.company = companyId;
  }

  // Find the employee with the highest employeeId
  const employees = await UserModel.find(query)
    .select("employeeId")
    .lean();

  let maxNum = 0;
  for (const emp of employees) {
    if (emp.employeeId) {
      const match = emp.employeeId.match(/^EMP[-_]?(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const nextEmployeeId = `EMP-${String(nextNum).padStart(4, "0")}`;
  const lastEmployeeId = maxNum > 0 ? `EMP-${String(maxNum).padStart(4, "0")}` : null;

  return {
    nextEmployeeId,
    lastEmployeeId,
    sequenceNumber: nextNum,
  };
};

export const EmployeeServices = {
  getEmployeeHomeSummary,
  getEmployeeOperationalHistory,
  getEmployeeAuthorizedLocations,
  batchOfflineSync,
  getNextEmployeeIdToDB
};
