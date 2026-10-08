import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../erros/AppError";
import { LocationServices } from "./location.service";
import { CompanyModel } from "../Company/company.model";

const createLocation = catchAsync(async (req, res) => {
  let company = req.body.company || req.user?.company;
  if (!company) {
    const defaultCompany = await CompanyModel.findOne({ isActive: true });
    if (defaultCompany) {
      company = defaultCompany._id.toString();
    } else {
      throw new AppError(HttpStatus.BAD_REQUEST, "Company is required");
    }
  }
  const result = await LocationServices.createLocationIntoDB({
    ...req.body,
    company,
  });

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Location created successfully",
    data: result,
  });
});

const getAllLocations = catchAsync(async (req, res) => {
  const companyId =
    (req.query.companyId as string) ||
    (req.user?.role !== "super_admin" ? (req.user?.company as string) : undefined);
  const customerId = req.query.customerId as string;
  const result = await LocationServices.getAllLocationsFromDB(companyId, customerId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Locations retrieved successfully",
    data: result,
  });
});

const getLocationById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await LocationServices.getLocationByIdFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Location retrieved successfully",
    data: result,
  });
});

const updateLocation = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await LocationServices.updateLocationInDB(id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Location updated successfully",
    data: result,
  });
});

const deleteLocation = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await LocationServices.deleteLocationFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Location deactivated successfully",
    data: result,
  });
});

export const LocationControllers = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
