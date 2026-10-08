import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { ReportModel } from "./report.model";
import { UserModel } from "../User/user.model";
import { IReport } from "./report.interface";
import { sendNotification, sendNotificationToCompanyRoles } from "../Notification/notification.utils";

const createReportIntoDB = async (userId: string, payload: Partial<IReport>) => {
  const user = await UserModel.findById(userId);
  if (!user || !user.company) {
    throw new AppError(HttpStatus.FORBIDDEN, "User or company not found");
  }

  const newReport = await ReportModel.create({
    ...payload,
    author: userId,
    company: user.company,
  });
  
  // If report has an explicitly assigned manager/reviewer, notify them
  if (newReport.assignedTo) {
    await sendNotification({
      recipientId: newReport.assignedTo.toString(),
      senderId: userId,
      type: "report",
      title: "New Report Submitted",
      message: `A new ${newReport.type} report was submitted: "${newReport.title}"`,
      data: { reportId: newReport._id.toString() }
    });
  }

  // Also notify Company Admin and Managers of this company
  await sendNotificationToCompanyRoles({
    companyId: user.company.toString(),
    roles: ["manager", "company_admin"],
    type: "report",
    title: "New Report Submitted",
    message: `${user.name || user.firstName || 'An employee'} submitted a ${newReport.type} report: "${newReport.title}"`,
    data: { reportId: newReport._id.toString(), reportType: newReport.type },
    senderId: userId,
  });
  
  return newReport;
};

const getAllReportsFromDB = async (
  companyId: string,
  locationId?: string,
  status?: string,
  authorId?: string,
  employeeUserId?: string,
  searchTerm?: string
) => {
  const query: any = { company: companyId, isActive: true };
  if (locationId) query.location = locationId;
  if (status && status !== "all") query.status = status;
  if (authorId) query.author = authorId;

  if (employeeUserId && !authorId) {
    const emp = await UserModel.findById(employeeUserId);
    const assignedLocs = (emp?.assignedLocations && emp.assignedLocations.length > 0)
      ? emp.assignedLocations
      : (emp?.assignedLocation ? [emp.assignedLocation] : []);

    if (assignedLocs.length > 0) {
      query.$or = [
        { author: employeeUserId },
        { location: { $in: assignedLocs } }
      ];
    }
  }

  if (searchTerm) {
    const searchFilter = [
      { title: { $regex: searchTerm, $options: "i" } },
      { summary: { $regex: searchTerm, $options: "i" } },
      { reportId: { $regex: searchTerm, $options: "i" } },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchFilter }];
      delete query.$or;
    } else {
      query.$or = searchFilter;
    }
  }
  
  return await ReportModel.find(query)
    .sort({ createdAt: -1 })
    .populate("author", "firstName lastName email employeeId avatar")
    .populate("assignedTo", "firstName lastName email")
    .populate("assignedReviewer", "firstName lastName email")
    .populate("location", "name address")
    .populate("customer", "companyName");
};

const getReportByIdFromDB = async (id: string, companyId: string) => {
  const report = await ReportModel.findOne({ _id: id, company: companyId })
    .populate("author", "firstName lastName email employeeId avatar")
    .populate("assignedTo", "firstName lastName email")
    .populate("assignedReviewer", "firstName lastName email")
    .populate("location", "name address")
    .populate("customer", "companyName");
    
  if (!report) {
    throw new AppError(HttpStatus.NOT_FOUND, "Report not found");
  }
  return report;
};

const updateReportInDB = async (id: string, companyId: string, userId: string, payload: Partial<IReport>) => {
  const report = await ReportModel.findOne({ _id: id, company: companyId });
  if (!report) {
    throw new AppError(HttpStatus.NOT_FOUND, "Report not found");
  }

  if (payload.status === "resolved" && report.status !== "resolved") {
    payload.resolvedAt = new Date();
    payload.resolvedBy = userId as any;
  }

  const updatedReport = await ReportModel.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  return updatedReport;
};

const reviewReportInDB = async (
  id: string,
  reviewerId: string,
  payload: { status: "approved" | "rejected" | "returned" | "under_review"; reviewComments?: string }
) => {
  const report = await ReportModel.findById(id);
  if (!report) {
    throw new AppError(HttpStatus.NOT_FOUND, "Report not found");
  }

  report.status = payload.status;
  report.assignedReviewer = reviewerId as any;
  report.reviewedAt = new Date();
  if (payload.reviewComments) report.reviewComments = payload.reviewComments;

  await report.save();

  // Notify author
  if (report.author) {
    const titles = {
      approved: "Report Approved",
      rejected: "Report Rejected",
      returned: "Report Returned for Changes",
      under_review: "Report Under Review",
    };

    await sendNotification({
      recipientId: report.author.toString(),
      senderId: reviewerId,
      type: "report",
      title: titles[payload.status] || "Report Updated",
      message: `Your report "${report.title}" is ${payload.status}.${payload.reviewComments ? ` Comment: ${payload.reviewComments}` : ""}`,
      data: { reportId: report._id.toString() }
    });
  }

  return report;
};

export const ReportServices = {
  createReportIntoDB,
  getAllReportsFromDB,
  getReportByIdFromDB,
  updateReportInDB,
  reviewReportInDB
};
