import { Model, Types } from "mongoose";

export interface IAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  province?: string;
  country: string;
}

export interface IPaymentMethod {
  brand: string;
  last4: string;
  expiry: string;
}

export interface IUsageLimits {
  maxEmployees: number;
  maxLocations: number;
  storageLimitGb: number;
}

export interface ICompanyCounts {
  employeeCount: number;
  locationCount: number;
  customerCount: number;
  activeModulesCount: number;
}

export interface IBranding {
  primaryColor: string;
  secondaryColor: string;
  defaultLanguage: "en" | "nl" | "de";
}

export interface ISetupProgress {
  companyProfile: boolean;
  customers: boolean;
  locations: boolean;
  employees: boolean;
  rolesPermissions: boolean;
  nfcCheckpoints: boolean;
  patrolRoutes: boolean;
  tasksChecklists: boolean;
  reportTemplates: boolean;
}

export interface ICompanyModules {
  workforce: boolean;
  employees: boolean;
  customers: boolean;
  locations: boolean;
  tasks: boolean;
  checklists: boolean;
  reports: boolean;
  timeTracking: boolean;
  patrols: boolean;
  incidentReports: boolean;
  certificates: boolean;
  notifications: boolean;
  clientPortal: boolean;
  nfcCheckpoints: boolean;
  gpsVerification: boolean;
  documents: boolean;
  communication: boolean;
  aiAssistant: boolean;
}

export interface ICompany {
  _id?: Types.ObjectId;
  
  // Identity
  name: string; // trading name
  legalName?: string;
  tradingName?: string;
  registrationNumber?: string; // e.g., "KVK-98765432"
  vatNumber?: string; // e.g., "NL859876543B01"
  sector?: "security" | "facility_management" | "logistics" | "retail";
  
  // Contact
  contactEmail: string;
  businessEmail?: string;
  phone?: string;
  
  // Address
  address?: IAddress;
  
  logo?: string; // URL
  timezone?: string; // e.g., "Europe/Amsterdam"
  
  // Subscription & Account Type
  accountType?: "trial" | "pilot" | "paid";
  subscriptionPlan?: Types.ObjectId; // ref to SubscriptionPlan
  subscriptionStatus: "active" | "trial" | "grace_period" | "suspended" | "cancelled";
  billingCycle?: "monthly" | "annual";
  nextPaymentDate?: Date;
  trialEndsAt?: Date;
  pilotDuration?: string;
  paymentMethod?: IPaymentMethod;
  
  // Modules enabled by Super Admin
  enabledModules?: ICompanyModules;
  
  // Usage Limits
  limits?: IUsageLimits;
  
  // Counts (denormalized for dashboard)
  counts?: ICompanyCounts;
  
  // Branding
  branding?: IBranding;
  
  // Setup progress (onboarding wizard)
  setupProgress?: ISetupProgress;
  
  isActive: boolean;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyInterface extends Model<ICompany> {}
