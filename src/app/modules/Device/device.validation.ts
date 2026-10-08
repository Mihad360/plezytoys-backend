import { z } from "zod";

export const registerDeviceSchema = z.object({
  body: z.object({
    deviceName: z.string().min(1, "Device name is required"),
    deviceId: z.string().min(1, "Device ID is required"),
  })
});

export const updateDeviceStatusSchema = z.object({
  body: z.object({
    registrationStatus: z.enum(["pending", "approved", "rejected", "revoked"]).optional(),
    isCurrentDevice: z.boolean().optional(),
    isLostOrStolen: z.boolean().optional(),
    autoLockMinutes: z.number().optional(),
  })
});

export const DeviceValidations = {
  registerDeviceSchema,
  updateDeviceStatusSchema,
};
