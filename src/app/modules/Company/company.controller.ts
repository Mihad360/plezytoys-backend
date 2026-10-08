import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CompanyServices } from "./company.service";
import { JwtPayload } from "../../interface/global";
import { UserModel } from "../User/user.model";
import AppError from "../../erros/AppError";

const createCompany = catchAsync(async (req, res) => {
  const result = await CompanyServices.createCompanyIntoDB(req.body);

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Company created successfully",
    data: result,
  });
});

const getAllCompanies = catchAsync(async (req, res) => {
  const result = await CompanyServices.getAllCompaniesFromDB();

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Companies retrieved successfully",
    data: result,
  });
});

const getCompanyById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CompanyServices.getCompanyByIdFromDB(id as string);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company retrieved successfully",
    data: result,
  });
});

const getMyCompany = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const userDoc = await UserModel.findById(user.user);
  if (!userDoc || !userDoc.company) throw new AppError(HttpStatus.FORBIDDEN, "Company association required");

  const result = await CompanyServices.getMyCompanyFromDB(userDoc.company.toString());

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company profile retrieved successfully",
    data: result,
  });
});

const updateCompany = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CompanyServices.updateCompanyInDB(id as string, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company updated successfully",
    data: result,
  });
});

const updateCompanyModules = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CompanyServices.updateCompanyModulesInDB(id as string, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "Company modules updated successfully",
    data: result,
  });
});

const deleteCompany = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isPermanent = req.query.permanent === "true";
  const result = await CompanyServices.deleteCompanyFromDB(id as string, isPermanent);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: isPermanent ? "Company deleted permanently" : "Company deactivated successfully",
    data: result,
  });
});

const createCompanyAdmin = catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const result = await CompanyServices.createCompanyAdminForCompany(companyId as string, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "Company Admin created successfully",
    data: result,
  });
});

export const CompanyControllers = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  updateCompany,
  updateCompanyModules,
  deleteCompany,
  createCompanyAdmin,
};
