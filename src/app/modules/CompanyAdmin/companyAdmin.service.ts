import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { UserModel } from "../User/user.model";
import { LocationModel } from "../Location/location.model";
import { CustomerModel } from "../Customer/customer.model";
import { CompanyModel } from "../Company/company.model";
import { WorkSessionModel } from "../WorkSession/workSession.model";
import { TaskModel } from "../Task/task.model";
import { ReportModel } from "../Report/report.model";
import { DocumentModel } from "../Document/document.model";
import QueryBuilder from "../../../builder/QueryBuilder";

const getCompanyDashboardStats = async (companyId: string) => {
  const totalEmployees = await UserModel.countDocuments({ company: companyId, role: "employee", isActive: true });
  const totalManagers = await UserModel.countDocuments({ company: companyId, role: "manager", isActive: true });
  const totalLocations = await LocationModel.countDocuments({ company: companyId, status: "active" });
  const totalCustomers = await CustomerModel.countDocuments({ company: companyId, isActive: true });
  
  // Real-time operations stats
  const currentlyClockedIn = await WorkSessionModel.countDocuments({ company: companyId, status: "active" });
  const openTasks = await TaskModel.countDocuments({ company: companyId, status: { $in: ["pending", "in_progress", "assigned"] } });
  const pendingReports = await ReportModel.countDocuments({ company: companyId, status: { $in: ["open", "submitted", "under_review"] } });
  const expiringDocuments = await DocumentModel.countDocuments({ company: companyId, status: "expiring_soon" });
  
  // Recent activity
  const recentReports = await ReportModel.find({ company: companyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("author", "firstName lastName name");
    
  return {
    totalEmployees,
    totalManagers,
    totalLocations,
    totalCustomers,
    currentlyClockedIn,
    openTasks,
    pendingReports,
    expiringDocuments,
    recentReports
  };
};

const getCompanyEmployeesFromDB = async (companyId: string, query: Record<string, unknown>) => {
  const employeeQuery = new QueryBuilder(
    UserModel.find({ company: companyId, role: "employee" })
      .populate("assignedLocation", "name")
      .populate("assignedManager", "firstName lastName name"),
    query
  )
    .search(["firstName", "lastName", "email", "phone", "employeeId"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const employees = await employeeQuery.modelQuery;
  const meta = await employeeQuery.countTotal();

  return { employees, meta };
};

const getCompanyDashboardCharts = async (companyId: string) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Task Completion over last 7 days
  const tasksChart = await TaskModel.aggregate([
    {
      $match: {
        company: companyId,
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $in: ["$status", ["completed", "approved"]] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 2. Attendance (Clock Ins) over last 7 days
  const attendanceChart = await WorkSessionModel.aggregate([
    {
      $match: {
        company: companyId,
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        clockIns: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    tasksChart,
    attendanceChart
  };
};

const getWorkingTimeWeeklySummary = async (companyId: string, startDateStr?: string) => {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
  
  const monday = startDateStr ? new Date(startDateStr) : new Date(now.setDate(now.getDate() + diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const employees = await UserModel.find({ company: companyId, role: "employee", status: "active" })
    .select("firstName lastName name employeeId");

  const sessions = await WorkSessionModel.find({
    company: companyId,
    clockInTime: { $gte: monday, $lte: sunday },
    status: { $in: ["completed", "active"] }
  });

  const formatMinutes = (totalMin: number) => {
    if (!totalMin || totalMin === 0) return "—";
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const summary = employees.map(emp => {
    const empSessions = sessions.filter(s => s.user.toString() === emp._id.toString());
    
    const dayTotals: Record<string, number> = {
      mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0
    };

    empSessions.forEach(s => {
      const day = dayMap[new Date(s.clockInTime).getDay()];
      const duration = s.durationMinutes || (s.clockOutTime 
        ? Math.floor((new Date(s.clockOutTime).getTime() - new Date(s.clockInTime).getTime()) / 60000)
        : Math.floor((Date.now() - new Date(s.clockInTime).getTime()) / 60000));
      dayTotals[day] = (dayTotals[day] || 0) + duration;
    });

    const weeklyTotalMin = Object.values(dayTotals).reduce((a, b) => a + b, 0);

    return {
      id: emp._id,
      name: emp.name || `${emp.firstName} ${emp.lastName}`.trim(),
      employeeId: emp.employeeId,
      mon: formatMinutes(dayTotals.mon),
      tue: formatMinutes(dayTotals.tue),
      wed: formatMinutes(dayTotals.wed),
      thu: formatMinutes(dayTotals.thu),
      fri: formatMinutes(dayTotals.fri),
      sat: formatMinutes(dayTotals.sat),
      sun: formatMinutes(dayTotals.sun),
      totalMinutes: weeklyTotalMin,
      total: formatMinutes(weeklyTotalMin),
    };
  });

  return {
    weekStart: monday,
    weekEnd: sunday,
    summary
  };
};

const updateCompanySettings = async (companyId: string, payload: any) => {
  const company = await CompanyModel.findByIdAndUpdate(
    companyId,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return company;
};

export const CompanyAdminServices = {
  getCompanyDashboardStats,
  getCompanyDashboardCharts,
  getCompanyEmployeesFromDB,
  getWorkingTimeWeeklySummary,
  updateCompanySettings
};
