import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../erros/AppError";
import { PatrolRouteServices } from "./patrolRoute.service";
import { CompanyModel } from "../Company/company.model";

const createPatrolRoute = catchAsync(async (req, res) => {
  let company = req.body.company || req.user?.company;
  if (!company) {
    const defaultCompany = await CompanyModel.findOne({ isActive: true });
    if (defaultCompany) {
      company = defaultCompany._id.toString();
    } else {
      throw new AppError(HttpStatus.BAD_REQUEST, "Company is required");
    }
  }
  const result = await PatrolRouteServices.createPatrolRouteIntoDB({
    ...req.body,
    company,
  });

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Patrol Route created successfully",
    data: result,
  });
});

const getAllPatrolRoutes = catchAsync(async (req, res) => {
  const companyId =
    (req.query.companyId as string) ||
    (req.user?.role !== "super_admin" ? (req.user?.company as string) : undefined);
  const locationId = req.query.locationId as string;
  const result = await PatrolRouteServices.getAllPatrolRoutesFromDB(companyId, locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol Routes retrieved successfully",
    data: result,
  });
});

const getPatrolRouteById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await PatrolRouteServices.getPatrolRouteByIdFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol Route retrieved successfully",
    data: result,
  });
});

const updatePatrolRoute = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await PatrolRouteServices.updatePatrolRouteInDB(id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol Route updated successfully",
    data: result,
  });
});

const deletePatrolRoute = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await PatrolRouteServices.deletePatrolRouteFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Patrol Route deactivated successfully",
    data: result,
  });
});

export const PatrolRouteControllers = {
  createPatrolRoute,
  getAllPatrolRoutes,
  getPatrolRouteById,
  updatePatrolRoute,
  deletePatrolRoute,
};
