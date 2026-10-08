import { Model, Types } from "mongoose";

export interface IPortalConfig {
  allowedReportTypes?: string[];
  permissions?: {
    reports: ("view" | "download" | "comment" | "approve")[];
    tasks: boolean;
    attendance: boolean;
    announcements: boolean;
  };
  locationScope?: Types.ObjectId[]; // ref to Location
}

export interface ICustomer {
  _id?: Types.ObjectId;
  customerId?: string; // e.g., "CUS-10024"
  companyName: string; // e.g., "Northgate Facilities"
  customerReference?: string;
  company: Types.ObjectId; // ref to Company
  
  // Contact
  contactName?: string;
  phone?: string;
  generalEmail?: string;
  
  // Address
  address?: {
    streetAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  
  // Business details
  businessRegistrationNumber?: string;
  vatNumber?: string;
  internalNotes?: string;
  
  // Portal
  portalStatus: "enabled" | "disabled";
  portalConfig?: IPortalConfig;
  
  // Counts (denormalized)
  locationsCount?: number;
  employeesCount?: number;
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerInterface extends Model<ICustomer> {
  generateCustomerId(): Promise<string>;
}
