import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { SubscriptionPlanModel } from "./subscriptionPlan.model";
import { ISubscriptionPlan } from "./subscriptionPlan.interface";

const createPlan = async (payload: any) => {
  const name = payload.name || payload.planName;
  const price = typeof payload.price === "number" ? payload.price : parseFloat(payload.monthlyPrice || payload.annualPrice || "0") || 0;
  const billingPeriod = (payload.billingPeriod || "monthly").toLowerCase() === "yearly" || (payload.billingPeriod || "").toLowerCase() === "annual" ? "yearly" : "monthly";
  const features = payload.features || payload.selectedModules || [];
  const maxEmployees = payload.maxEmployees !== undefined ? payload.maxEmployees : (payload.employeesLimit && !isNaN(Number(payload.employeesLimit)) ? Number(payload.employeesLimit) : undefined);
  const maxLocations = payload.maxLocations !== undefined ? payload.maxLocations : (payload.locationsLimit && !isNaN(Number(payload.locationsLimit)) ? Number(payload.locationsLimit) : undefined);
  const isActive = payload.isActive !== undefined ? payload.isActive : (payload.planStatus ? payload.planStatus.toLowerCase() === "active" : true);

  return await SubscriptionPlanModel.create({
    name,
    price,
    billingPeriod,
    features,
    maxEmployees,
    maxLocations,
    isActive,
  });
};

const getPlans = async () => {
  return await SubscriptionPlanModel.find();
};

const getPlanById = async (id: string) => {
  const plan = await SubscriptionPlanModel.findById(id);
  if (!plan) throw new AppError(HttpStatus.NOT_FOUND, "Plan not found");
  return plan;
};

const updatePlan = async (id: string, payload: any) => {
  const plan = await SubscriptionPlanModel.findById(id);
  if (!plan) throw new AppError(HttpStatus.NOT_FOUND, "Plan not found");

  const updateData: any = {};
  if (payload.name || payload.planName) updateData.name = payload.name || payload.planName;
  if (payload.price !== undefined) updateData.price = Number(payload.price);
  else if (payload.monthlyPrice !== undefined) updateData.price = parseFloat(payload.monthlyPrice) || 0;
  if (payload.billingPeriod) {
    updateData.billingPeriod = payload.billingPeriod.toLowerCase() === "yearly" || payload.billingPeriod.toLowerCase() === "annual" ? "yearly" : "monthly";
  }
  if (payload.features || payload.selectedModules) updateData.features = payload.features || payload.selectedModules;
  if (payload.maxEmployees !== undefined) updateData.maxEmployees = Number(payload.maxEmployees);
  else if (payload.employeesLimit && !isNaN(Number(payload.employeesLimit))) updateData.maxEmployees = Number(payload.employeesLimit);
  if (payload.maxLocations !== undefined) updateData.maxLocations = Number(payload.maxLocations);
  else if (payload.locationsLimit && !isNaN(Number(payload.locationsLimit))) updateData.maxLocations = Number(payload.locationsLimit);
  if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
  else if (payload.planStatus) updateData.isActive = payload.planStatus.toLowerCase() === "active";

  return await SubscriptionPlanModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
};

const deletePlan = async (id: string) => {
  const plan = await SubscriptionPlanModel.findById(id);
  if (!plan) throw new AppError(HttpStatus.NOT_FOUND, "Plan not found");
  return await SubscriptionPlanModel.findByIdAndDelete(id);
};

export const SubscriptionPlanServices = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
};
