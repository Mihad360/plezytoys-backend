import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { CompanyModel } from "./company.model";
import { ICompany, ICompanyModules } from "./company.interface";
import { UserModel } from "../User/user.model";
import { Types } from "mongoose";
import { sendNotificationToCompanyRoles } from "../Notification/notification.utils";

import { SubscriptionPlanModel } from "../SubscriptionPlan/subscriptionPlan.model";

const createCompanyIntoDB = async (payload: any) => {
  const companyName = payload.companyName || payload.name;
  const contactEmail = (payload.businessEmail || payload.contactEmail || "").toLowerCase().trim();
  const phone = payload.phoneNumber || payload.phone;
  const sector = payload.sector || "Security";
  const planName = payload.plan || payload.subscriptionPlan || "Starter";
  const rawStatus = (payload.status || payload.subscriptionStatus || "Trial").toLowerCase();
  const pilotDuration = payload.pilotDuration;

  const existingCompany = await CompanyModel.findOne({ contactEmail });
  if (existingCompany) {
    throw new AppError(HttpStatus.CONFLICT, "A company with this business email already exists.");
  }

  // Calculate trial ends at if pilot duration is specified
  let trialEndsAt: Date | undefined;
  if (pilotDuration) {
    const months = parseInt(pilotDuration, 10) || (pilotDuration.includes("1") ? 1 : pilotDuration.includes("2") ? 2 : pilotDuration.includes("3") ? 3 : pilotDuration.includes("6") ? 6 : 1);
    trialEndsAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  }

  // Find matching subscription plan ID if exists
  let subscriptionPlanId = payload.subscriptionPlan;
  if (!subscriptionPlanId || !Types.ObjectId.isValid(subscriptionPlanId)) {
    const planDoc = await SubscriptionPlanModel.findOne({
      name: new RegExp(`^${planName}`, "i"),
    });
    if (planDoc) {
      subscriptionPlanId = planDoc._id;
    }
  }

  const {
    adminFirstName,
    adminLastName,
    adminFullName,
    adminEmail,
    adminPassword,
    companyName: _cName,
    businessEmail: _bEmail,
    phoneNumber: _pNum,
    plan: _plan,
    status: _stat,
    ...restPayload
  } = payload;

  const newCompany = await CompanyModel.create({
    ...restPayload,
    name: companyName,
    contactEmail,
    businessEmail: contactEmail,
    phone,
    sector,
    subscriptionPlan: subscriptionPlanId,
    subscriptionStatus: rawStatus === "active" ? "active" : "trial",
    accountType: rawStatus === "active" ? "paid" : "trial",
    pilotDuration,
    trialEndsAt,
  });

  // If initial admin credentials provided, create or link the company_admin user automatically
  const targetAdminEmail = (adminEmail || contactEmail || "").toLowerCase().trim();
  if (targetAdminEmail) {
    let firstName = adminFirstName || "Company";
    let lastName = adminLastName || "Admin";
    if (adminFullName) {
      const parts = adminFullName.trim().split(" ");
      firstName = parts[0] || firstName;
      lastName = parts.slice(1).join(" ") || lastName;
    }

    const existingUser = await UserModel.findOne({ email: targetAdminEmail });
    if (!existingUser) {
      await UserModel.create({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: targetAdminEmail,
        password: adminPassword || "password123",
        role: "company_admin",
        company: newCompany._id,
        phone,
        status: "active",
        isVerified: true,
      });
    } else {
      existingUser.company = newCompany._id as any;
      existingUser.role = "company_admin";
      if (!existingUser.status || existingUser.status === "inactive") {
        existingUser.status = "active";
      }
      await existingUser.save();
    }
  }

  return newCompany;
};

const getAllCompaniesFromDB = async () => {
  const companies = await CompanyModel.find()
    .populate("subscriptionPlan", "name price billingPeriod")
    .sort({ createdAt: -1 });
  return companies;
};

const getCompanyByIdFromDB = async (id: string) => {
  const company = await CompanyModel.findById(id).populate("subscriptionPlan");
  if (!company) {
    throw new AppError(HttpStatus.NOT_FOUND, "Company not found");
  }
  return company;
};

const getMyCompanyFromDB = async (companyId: string) => {
  const company = await CompanyModel.findById(companyId).populate("subscriptionPlan");
  if (!company) {
    throw new AppError(HttpStatus.NOT_FOUND, "Company not found");
  }
  return company;
};

const updateCompanyInDB = async (id: string, payload: any) => {
  const company = await CompanyModel.findById(id);
  if (!company) {
    throw new AppError(HttpStatus.NOT_FOUND, "Company not found");
  }

  const updateData: any = { ...payload };

  if (payload.companyName && !payload.name) {
    updateData.name = payload.companyName;
  }
  if (payload.phoneNumber && !payload.phone) {
    updateData.phone = payload.phoneNumber;
  }
  const email = (payload.businessEmail || payload.contactEmail || "").toLowerCase().trim();
  if (email) {
    updateData.contactEmail = email;
    updateData.businessEmail = email;
  }

  if (payload.subscriptionPlan && !Types.ObjectId.isValid(payload.subscriptionPlan)) {
    const planDoc = await SubscriptionPlanModel.findOne({
      name: new RegExp(`^${payload.subscriptionPlan}`, "i"),
    });
    if (planDoc) {
      updateData.subscriptionPlan = planDoc._id;
    }
  }

  const updatedCompany = await CompanyModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("subscriptionPlan");
  return updatedCompany;
};

const updateCompanyModulesInDB = async (id: string, modulesPayload: Partial<ICompanyModules>) => {
  const company = await CompanyModel.findById(id);
  if (!company) {
    throw new AppError(HttpStatus.NOT_FOUND, "Company not found");
  }

  const existingModules = company.enabledModules ? JSON.parse(JSON.stringify(company.enabledModules)) : {};
  const updatedCompany = await CompanyModel.findByIdAndUpdate(
    id,
    { $set: { enabledModules: { ...existingModules, ...modulesPayload } } },
    { new: true }
  );

  await sendNotificationToCompanyRoles({
    companyId: id,
    roles: ["company_admin"],
    type: "system",
    title: "Company Modules Updated",
    message: "Your company's enabled system modules and permissions have been updated by administrator.",
    data: { companyId: id },
  });

  return updatedCompany;
};

const deleteCompanyFromDB = async (id: string, permanent: boolean = false) => {
  const company = await CompanyModel.findById(id);
  if (!company) {
    throw new AppError(HttpStatus.NOT_FOUND, "Company not found");
  }

  if (permanent) {
    await CompanyModel.findByIdAndDelete(id);
    return { _id: id, isDeleted: true };
  }

  const deletedCompany = await CompanyModel.findByIdAndUpdate(
    id,
    { isActive: false, subscriptionStatus: "cancelled" },
    { new: true }
  );
  return deletedCompany;
};

const createCompanyAdminForCompany = async (companyId: string, payload: any) => {
  const company = await CompanyModel.findById(companyId);
  if (!company) {
    throw new AppError(HttpStatus.NOT_FOUND, "Company not found");
  }

  const newCompanyAdmin = await UserModel.create({
    ...payload,
    role: "company_admin",
    company: company._id,
    status: "active",
    isVerified: true
  });

  return newCompanyAdmin;
};

export const CompanyServices = {
  createCompanyIntoDB,
  getAllCompaniesFromDB,
  getCompanyByIdFromDB,
  getMyCompanyFromDB,
  updateCompanyInDB,
  updateCompanyModulesInDB,
  deleteCompanyFromDB,
  createCompanyAdminForCompany
};
