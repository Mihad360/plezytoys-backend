import { Schema, model } from "mongoose";
import { ICompany, CompanyInterface } from "./company.interface";

const addressSchema = new Schema(
  {
    street: { type: String },
    houseNumber: { type: String },
    postalCode: { type: String },
    city: { type: String },
    province: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const paymentMethodSchema = new Schema(
  {
    brand: { type: String },
    last4: { type: String },
    expiry: { type: String },
  },
  { _id: false }
);

const usageLimitsSchema = new Schema(
  {
    maxEmployees: { type: Number, default: 0 },
    maxLocations: { type: Number, default: 0 },
    storageLimitGb: { type: Number, default: 0 },
  },
  { _id: false }
);

const companyCountsSchema = new Schema(
  {
    employeeCount: { type: Number, default: 0 },
    locationCount: { type: Number, default: 0 },
    customerCount: { type: Number, default: 0 },
    activeModulesCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const brandingSchema = new Schema(
  {
    primaryColor: { type: String, default: "#F47B20" },
    secondaryColor: { type: String, default: "#1B2B4B" },
    defaultLanguage: { type: String, enum: ["en", "nl", "de"], default: "en" },
  },
  { _id: false }
);

const setupProgressSchema = new Schema(
  {
    companyProfile: { type: Boolean, default: false },
    customers: { type: Boolean, default: false },
    locations: { type: Boolean, default: false },
    employees: { type: Boolean, default: false },
    rolesPermissions: { type: Boolean, default: false },
    nfcCheckpoints: { type: Boolean, default: false },
    patrolRoutes: { type: Boolean, default: false },
    tasksChecklists: { type: Boolean, default: false },
    reportTemplates: { type: Boolean, default: false },
  },
  { _id: false }
);

const enabledModulesSchema = new Schema(
  {
    workforce: { type: Boolean, default: true },
    employees: { type: Boolean, default: true },
    customers: { type: Boolean, default: true },
    locations: { type: Boolean, default: true },
    tasks: { type: Boolean, default: true },
    checklists: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    timeTracking: { type: Boolean, default: true },
    patrols: { type: Boolean, default: true },
    incidentReports: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    clientPortal: { type: Boolean, default: true },
    nfcCheckpoints: { type: Boolean, default: false },
    gpsVerification: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    communication: { type: Boolean, default: false },
    aiAssistant: { type: Boolean, default: true },
  },
  { _id: false }
);

const companySchema = new Schema<ICompany, CompanyInterface>(
  {
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    tradingName: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    vatNumber: { type: String, trim: true },
    sector: {
      type: String,
      default: "security",
    },

    contactEmail: { type: String, required: true, trim: true },
    businessEmail: { type: String, trim: true },
    phone: { type: String, trim: true },

    address: { type: addressSchema },
    logo: { type: String },
    timezone: { type: String, default: "Europe/Amsterdam" },

    accountType: {
      type: String,
      default: "trial",
    },
    subscriptionPlan: { type: Schema.Types.ObjectId, ref: "SubscriptionPlan" },
    subscriptionStatus: {
      type: String,
      default: "trial",
    },
    pilotDuration: { type: String },
    billingCycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    nextPaymentDate: { type: Date },
    trialEndsAt: { type: Date },
    paymentMethod: { type: paymentMethodSchema },

    enabledModules: { type: enabledModulesSchema, default: () => ({}) },
    limits: { type: usageLimitsSchema },
    counts: { type: companyCountsSchema },
    branding: { type: brandingSchema, default: () => ({}) },
    setupProgress: { type: setupProgressSchema, default: () => ({}) },

    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const CompanyModel = model<ICompany, CompanyInterface>("Company", companySchema);
