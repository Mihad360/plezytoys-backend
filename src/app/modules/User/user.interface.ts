import { Model, Types } from "mongoose";

export interface ProfileImage {
  path: string;
  url: string;
}

export interface INotificationPreferences {
  newReports: boolean;
  patrolActivity: boolean;
  announcements: boolean;
}

export interface IUser {
  _id?: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  name?: string; // computed or combined
  initials?: string;
  email: string;
  phone?: string;
  password?: string; // made optional for invited users before they set a password
  jobTitle?: string;

  role: "super_admin" | "company_admin" | "manager" | "employee" | "admin" | "user"; // Keeping admin/user for backward compatibility with frontend JWT types if needed
  employeeId?: string; // e.g., EMP-1024
  company?: Types.ObjectId; // ref to Company

  // Status
  status: "active" | "invited" | "inactive" | "pending" | "suspended";
  accessStatus?: "registered" | "pending" | "not_registered";
  isVerified?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLogin?: Date;

  profileImage?: ProfileImage | string;
  avatar?: string;

  // Employee/Manager specific assignments
  assignedManager?: Types.ObjectId; // ref to User
  assignedCustomer?: Types.ObjectId; // ref to Customer
  assignedLocation?: Types.ObjectId; // ref to Location
  assignedLocations?: Types.ObjectId[]; // ref to Location (multiple for managers)
  assignedCustomers?: Types.ObjectId[]; // ref to Customer (multiple for managers)
  assignedEmployees?: Types.ObjectId[]; // ref to User (multiple for managers)

  // Roles & Permissions
  customRoles?: Types.ObjectId[]; // ref to Role

  // Security (mobile app)
  pin?: string;
  biometricEnabled?: boolean;
  autoLockMinutes?: number;

  // Preferences
  notificationPreferences?: INotificationPreferences;
  languagePreference?: "en" | "nl" | "de";

  fcmToken?: string[];
  
  // Auth boilerplate fields
  isActive?: boolean;
  otp?: string;
  expiresAt?: Date;
  isDeleted?: boolean;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInterface extends Model<IUser> {
  isUserExistByEmail(email: string): Promise<IUser>;
  compareUserPassword(
    payloadPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  newHashedPassword(newPassword: string): Promise<string>;
  isOldTokenValid(
    passwordChangedTime: Date,
    jwtIssuedTime: number,
  ): Promise<boolean>;
  isJwtIssuedBeforePasswordChange(
    passwordChangeTimeStamp: Date,
    jwtIssuedTimeStamp: number,
  ): boolean;
  isUserExistByCustomId(email: string): Promise<IUser>;
}
