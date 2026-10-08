import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../erros/AppError";
import { CustomerServices } from "./customer.service";
import { CompanyModel } from "../Company/company.model";

const createCustomer = catchAsync(async (req, res) => {
  let company = req.body.company || req.user?.company;
  if (!company) {
    const defaultCompany = await CompanyModel.findOne({ isActive: true });
    if (defaultCompany) {
      company = defaultCompany._id.toString();
    } else {
      throw new AppError(HttpStatus.BAD_REQUEST, "Company is required");
    }
  }
  const result = await CustomerServices.createCustomerIntoDB({
    ...req.body,
    company,
  });

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Customer created successfully",
    data: result,
  });
});

const getAllCustomers = catchAsync(async (req, res) => {
  const companyId =
    (req.query.companyId as string) ||
    (req.user?.role !== "super_admin" ? (req.user?.company as string) : undefined);
  const result = await CustomerServices.getAllCustomersFromDB(companyId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Customers retrieved successfully",
    data: result,
  });
});

const getCustomerById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await CustomerServices.getCustomerByIdFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Customer retrieved successfully",
    data: result,
  });
});

const updateCustomer = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await CustomerServices.updateCustomerInDB(id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Customer updated successfully",
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await CustomerServices.deleteCustomerFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Customer deactivated successfully",
    data: result,
  });
});

export const CustomerControllers = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
