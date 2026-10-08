import { SystemSettingsModel } from "./systemSettings.model";
import { ISystemSettings } from "./systemSettings.interface";
import { AuditLogServices } from "../../AuditLog/auditLog.service";

const getSettings = async () => {
  let settings = await SystemSettingsModel.findOne();
  if (!settings) {
    settings = await SystemSettingsModel.create({});
  }
  return settings;
};

const updateSettings = async (payload: Partial<ISystemSettings>, userId?: string, ipAddress?: string) => {
  let settings = await SystemSettingsModel.findOne();
  if (!settings) {
    settings = await SystemSettingsModel.create(payload);
  } else {
    // Merge subsections
    if (payload.platform) settings.platform = { ...settings.platform, ...payload.platform };
    if (payload.security) settings.security = { ...settings.security, ...payload.security };
    if (payload.authentication) settings.authentication = { ...settings.authentication, ...payload.authentication };
    if (payload.notifications) {
      settings.notifications = {
        ...settings.notifications,
        ...payload.notifications,
        triggers: {
          ...settings.notifications.triggers,
          ...(payload.notifications.triggers || {}),
        },
        channels: {
          ...settings.notifications.channels,
          ...(payload.notifications.channels || {}),
        },
      };
    }
    if (payload.data) settings.data = { ...settings.data, ...payload.data };
    if (payload.modules) {
      settings.modules = {
        ...settings.modules,
        ...payload.modules,
        enabledModules: {
          ...settings.modules?.enabledModules,
          ...(payload.modules.enabledModules || {}),
        },
      };
      settings.markModified("modules");
    }
    if (payload.platform) settings.markModified("platform");
    if (payload.security) settings.markModified("security");
    if (payload.authentication) settings.markModified("authentication");
    if (payload.notifications) settings.markModified("notifications");
    if (payload.data) settings.markModified("data");

    await settings.save();
  }

  if (userId) {
    await AuditLogServices.createLog({
      user: userId as any,
      action: "UPDATE_SYSTEM_SETTINGS",
      entityType: "SystemSettings",
      entityId: settings._id,
      details: "Super Admin updated platform system settings",
      ipAddress,
    });
  }

  return settings;
};

export const SystemSettingsServices = {
  getSettings,
  updateSettings,
};
