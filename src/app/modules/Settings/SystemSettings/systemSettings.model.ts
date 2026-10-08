import mongoose, { Schema } from "mongoose";
import { ISystemSettings } from "./systemSettings.interface";

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    platform: {
      platformName: { type: String, default: "SHIFTPOINT" },
      supportEmail: { type: String, default: "support@shiftpoint.io" },
      termsUrl: { type: String, default: "https://shiftpoint.io/terms" },
      privacyUrl: { type: String, default: "https://shiftpoint.io/privacy" },
      defaultLanguage: { type: String, default: "English" },
      defaultCurrency: { type: String, default: "EUR (€)" },
      timezone: { type: String, default: "Europe/Amsterdam (CET)" },
      dateTimeFormat: { type: String, default: "DD/MM/YYYY · 24-hour" },
      logoUrl: { type: String, default: "" },
      faviconUrl: { type: String, default: "" },
      maintenanceMode: { type: Boolean, default: false },
    },
    security: {
      require2faForAdmins: { type: Boolean, default: true },
      ipAllowlisting: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 30 },
      auditLoggingAllActions: { type: Boolean, default: true },
      passwordComplexityEnforced: { type: Boolean, default: true },
    },
    authentication: {
      mandatoryAdmin2fa: { type: Boolean, default: false },
      employeeBiometricUnlock: { type: Boolean, default: false },
      supportedLoginMethod: { type: String, default: "Email address or mobile phone number" },
      tokenLifetimeMinutes: { type: Number, default: 1440 },
      adminInactivityTimeoutMinutes: { type: Number, default: 30 },
      employeeAppInactivityLockMinutes: { type: Number, default: 5 },
    },
    notifications: {
      triggers: {
        newCompanyRegistrations: { type: Boolean, default: true },
        paymentsReceived: { type: Boolean, default: true },
        failedPayments: { type: Boolean, default: true },
        subscriptionPilotExpiry: { type: Boolean, default: true },
        supportTickets: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true },
        expiringEmployeeDocuments: { type: Boolean, default: true },
        missedTasks: { type: Boolean, default: true },
        missedNfcCheckpoints: { type: Boolean, default: true },
      },
      channels: {
        inApp: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
      },
    },
    data: {
      companyDataRetentionYears: { type: Number, default: 7 },
      backupRetentionDays: { type: Number, default: 90 },
      dataStorageRegion: { type: String, default: "EU only — Amsterdam region" },
      backupStatus: { type: String, default: "Healthy" },
      lastBackupTime: { type: String, default: "08:30" },
    },
    modules: {
      enabledModules: {
        employees: { type: Boolean, default: true },
        customers: { type: Boolean, default: true },
        locations: { type: Boolean, default: true },
        gpsClockInOut: { type: Boolean, default: true },
        nfcPatrols: { type: Boolean, default: true },
        tasksChecklists: { type: Boolean, default: true },
        reportsIncidents: { type: Boolean, default: true },
        documentsCertificates: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
        aiAssistant: { type: Boolean, default: false },
        customerGuestPortal: { type: Boolean, default: true },
      },
      assignedSector: { type: String, default: "All sectors" },
      assignedSubscriptionPlan: { type: String, default: "All plans" },
    },
  },
  { timestamps: true }
);

export const SystemSettingsModel =
  mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);
