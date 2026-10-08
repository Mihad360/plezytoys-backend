import HttpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../erros/AppError";
import { NfcServices } from "./nfc.service";
import { CompanyModel } from "../Company/company.model";

const createNfc = catchAsync(async (req, res) => {
  let company = req.body.company || req.user?.company;
  if (!company) {
    const defaultCompany = await CompanyModel.findOne({ isActive: true });
    if (defaultCompany) {
      company = defaultCompany._id.toString();
    } else {
      throw new AppError(HttpStatus.BAD_REQUEST, "Company is required");
    }
  }
  const result = await NfcServices.createNfcIntoDB({
    ...req.body,
    company,
  });

  sendResponse(res, {
    statusCode: HttpStatus.CREATED,
    success: true,
    message: "NFC Checkpoint created successfully",
    data: result,
  });
});

const getAllNfcs = catchAsync(async (req, res) => {
  const companyId =
    (req.query.companyId as string) ||
    (req.user?.role !== "super_admin" ? (req.user?.company as string) : undefined);
  const locationId = req.query.locationId as string;
  const result = await NfcServices.getAllNfcsFromDB(companyId, locationId);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "NFC Checkpoints retrieved successfully",
    data: result,
  });
});

const getNfcById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await NfcServices.getNfcByIdFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "NFC Checkpoint retrieved successfully",
    data: result,
  });
});

const updateNfc = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await NfcServices.updateNfcInDB(id, req.body);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "NFC Checkpoint updated successfully",
    data: result,
  });
});

const deleteNfc = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const result = await NfcServices.deleteNfcFromDB(id);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "NFC Checkpoint deactivated successfully",
    data: result,
  });
});

export const NfcControllers = {
  createNfc,
  getAllNfcs,
  getNfcById,
  updateNfc,
  deleteNfc,
};
