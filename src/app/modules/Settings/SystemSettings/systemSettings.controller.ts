import HttpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { SystemSettingsServices } from "./systemSettings.service";
import { sendFileToCloudinary } from "../../../utils/sendImageToCloudinary";

const getSettings = catchAsync(async (req, res) => {
  const result = await SystemSettingsServices.getSettings();

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "System settings retrieved successfully",
    data: result,
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const userId = req.user?.user as string | undefined;
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

  if (req.file) {
    const uploadResult = await sendFileToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "system/branding"
    );
    if (!req.body.platform) {
      req.body.platform = {};
    }
    req.body.platform.logoUrl = uploadResult.secure_url;
  }

  const result = await SystemSettingsServices.updateSettings(req.body, userId, ipAddress);

  sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: "System settings updated successfully",
    data: result,
  });
});

export const SystemSettingsControllers = {
  getSettings,
  updateSettings,
};
