import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { UserModel } from "../User/user.model";
import { CompanyModel } from "../Company/company.model";
import { CustomerModel } from "../Customer/customer.model";
import { SubscriptionPlanModel } from "../SubscriptionPlan/subscriptionPlan.model";
import { PaymentModel } from "../Payment/payment.model";
import QueryBuilder from "../../../builder/QueryBuilder";
import { sendNotificationToCompanyRoles } from "../Notification/notification.utils";

const getAllPlatformUsersFromDB = async (query: Record<string, unknown>) => {
  const usersQuery = new QueryBuilder(
    UserModel.find().populate('company', 'name'),
    query
  )
    .search(["firstName", "lastName", "email", "phone"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const users = await usersQuery.modelQuery;
  const meta = await usersQuery.countTotal();

  return { users, meta };
};

const updateUserRoleInDB = async (userId: string, role: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );
  return updatedUser;
};

const updateUserStatusInDB = async (userId: string, status: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(HttpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { status, isActive: status === "active" },
    { new: true }
  );
  return updatedUser;
};

const getGlobalDashboardStats = async () => {
  const totalCompanies = await CompanyModel.countDocuments();
  const totalUsers = await UserModel.countDocuments();
  const totalCustomers = await CustomerModel.countDocuments();
  
  const activeCompanies = await CompanyModel.countDocuments({ isActive: true });
  const suspendedCompanies = await CompanyModel.countDocuments({ subscriptionStatus: "suspended" });
  
  const totalPlans = await SubscriptionPlanModel.countDocuments();
  const recentPayments = await PaymentModel.find({ status: "paid" })
    .sort({ paidAt: -1 })
    .limit(5)
    .populate("company", "name");
  
  // Aggregate revenue
  const revenueResult = await PaymentModel.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;
  
  return {
    totalCompanies,
    activeCompanies,
    suspendedCompanies,
    totalUsers,
    totalCustomers,
    totalPlans,
    totalRevenue,
    recentPayments
  };
};

const getGlobalDashboardCharts = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Revenue over the last 30 days
  const revenueChart = await PaymentModel.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        revenue: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 2. New Companies onboarded over the last 30 days
  const signupsChart = await CompanyModel.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    revenueChart,
    signupsChart
  };
};

const getTrialsAndPilotsFromDB = async () => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const activeTrials = await CompanyModel.countDocuments({
    accountType: "trial",
    subscriptionStatus: { $in: ["trial", "active"] }
  });

  const activePilots = await CompanyModel.countDocuments({
    accountType: "pilot",
    subscriptionStatus: "active"
  });

  const expiringSoon = await CompanyModel.countDocuments({
    accountType: { $in: ["trial", "pilot"] },
    trialEndsAt: { $gte: now, $lte: sevenDaysFromNow }
  });

  const totalTrialsAndPilots = await CompanyModel.countDocuments({
    accountType: { $in: ["trial", "pilot"] }
  });
  const totalPaid = await CompanyModel.countDocuments({
    accountType: "paid",
    subscriptionStatus: "active"
  });

  const conversionRate = totalTrialsAndPilots > 0
    ? Math.round((totalPaid / (totalPaid + totalTrialsAndPilots)) * 100)
    : 0;

  const companies = await CompanyModel.find({
    accountType: { $in: ["trial", "pilot"] }
  })
    .sort({ createdAt: -1 })
    .populate("subscriptionPlan", "name");

  const companiesWithRemaining = companies.map(c => {
    let remainingDays = 0;
    if (c.trialEndsAt) {
      const diffMs = new Date(c.trialEndsAt).getTime() - now.getTime();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }
    return {
      ...c.toObject(),
      remainingDays,
      remainingFormatted: `${remainingDays} days`
    };
  });

  return {
    activeTrials,
    activePilots,
    conversionRate: `${conversionRate}%`,
    expiringSoon,
    companies: companiesWithRemaining
  };
};

const activatePilotInDB = async (companyId: string, payload: { durationDays: number; enabledModules?: any }) => {
  const company = await CompanyModel.findById(companyId);
  if (!company) throw new AppError(HttpStatus.NOT_FOUND, "Company not found");

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + (payload.durationDays || 30) * 24 * 60 * 60 * 1000);

  company.accountType = "pilot";
  company.subscriptionStatus = "active";
  company.trialEndsAt = trialEndsAt;
  if (payload.enabledModules) {
    const existingModules = company.enabledModules ? JSON.parse(JSON.stringify(company.enabledModules)) : {};
    company.enabledModules = { ...existingModules, ...payload.enabledModules };
  }

  await company.save();

  await sendNotificationToCompanyRoles({
    companyId,
    roles: ["company_admin"],
    type: "subscription",
    title: "Pilot Program Activated",
    message: `Your company account has been upgraded to an active Pilot Program valid until ${trialEndsAt.toLocaleDateString()}.`,
    data: { companyId, trialEndsAt },
  });

  return company;
};

export const SuperAdminServices = {
  getAllPlatformUsersFromDB,
  updateUserRoleInDB,
  updateUserStatusInDB,
  getGlobalDashboardStats,
  getGlobalDashboardCharts,
  getTrialsAndPilotsFromDB,
  activatePilotInDB
};
