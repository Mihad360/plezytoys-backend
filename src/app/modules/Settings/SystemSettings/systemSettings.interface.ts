export interface IPlatformSettings {
  platformName: string;
  supportEmail: string;
  termsUrl: string;
  privacyUrl: string;
  defaultLanguage: string;
  defaultCurrency: string;
  timezone: string;
  dateTimeFormat: string;
  logoUrl?: string;
  faviconUrl?: string;
  maintenanceMode: boolean;
}

export interface ISecuritySettings {
  require2faForAdmins: boolean;
  ipAllowlisting: boolean;
  sessionTimeoutMinutes: number;
  auditLoggingAllActions: boolean;
  passwordComplexityEnforced: boolean;
}

export interface IAuthenticationSettings {
  mandatoryAdmin2fa: boolean;
  employeeBiometricUnlock: boolean;
  supportedLoginMethod: string;
  tokenLifetimeMinutes: number;
  adminInactivityTimeoutMinutes: number;
  employeeAppInactivityLockMinutes: number;
}

export interface INotificationsSettings {
  triggers: {
    newCompanyRegistrations: boolean;
    paymentsReceived: boolean;
    failedPayments: boolean;
    subscriptionPilotExpiry: boolean;
    supportTickets: boolean;
    securityAlerts: boolean;
    expiringEmployeeDocuments: boolean;
    missedTasks: boolean;
    missedNfcCheckpoints: boolean;
  };
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
  };
}

export interface IDataSettings {
  companyDataRetentionYears: number;
  backupRetentionDays: number;
  dataStorageRegion: string;
  backupStatus: string;
  lastBackupTime?: string;
}

export interface IModulesSettings {
  enabledModules: {
    employees: boolean;
    customers: boolean;
    locations: boolean;
    gpsClockInOut: boolean;
    nfcPatrols: boolean;
    tasksChecklists: boolean;
    reportsIncidents: boolean;
    documentsCertificates: boolean;
    notifications: boolean;
    aiAssistant: boolean;
    customerGuestPortal: boolean;
  };
  assignedSector?: string;
  assignedSubscriptionPlan?: string;
}

export interface ISystemSettings {
  platform: IPlatformSettings;
  security: ISecuritySettings;
  authentication: IAuthenticationSettings;
  notifications: INotificationsSettings;
  data: IDataSettings;
  modules: IModulesSettings;
}
