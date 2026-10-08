import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubscriptionPlanServices } from "./subscriptionPlan.service";

const createPlan = catchAsync(async (req, res) => {
  const result = await SubscriptionPlanServices.createPlan(req.body);
  sendResponse(res, { statusCode: HttpStatus.CREATED, success: true, message: "Subscription Plan created", data: result });
});

const getPlans = catchAsync(async (req, res) => {
  const result = await SubscriptionPlanServices.getPlans();
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Subscription Plans retrieved", data: result });
});

const getPlanById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await SubscriptionPlanServices.getPlanById(id);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Subscription Plan retrieved", data: result });
});

const updatePlan = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await SubscriptionPlanServices.updatePlan(id, req.body);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Subscription Plan updated", data: result });
});

const deletePlan = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await SubscriptionPlanServices.deletePlan(id);
  sendResponse(res, { statusCode: HttpStatus.OK, success: true, message: "Subscription Plan deleted", data: result });
});

export const SubscriptionPlanControllers = { createPlan, getPlans, getPlanById, updatePlan, deletePlan };
