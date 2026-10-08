import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { IUser, UserInterface } from "./user.interface";

const profileImageSchema = new Schema(
  {
    path: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  { _id: false },
);

const notificationPreferencesSchema = new Schema(
  {
    newReports: { type: Boolean, default: true },
    patrolActivity: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, UserInterface>(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    name: { type: String, trim: true },
    initials: { type: String },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: { type: String, default: null },
    password: { type: String },
    jobTitle: { type: String },
    
    role: {
      type: String,
      enum: ["super_admin", "company_admin", "manager", "employee", "admin", "user"],
      default: "employee",
    },
    employeeId: { type: String },
    company: { type: Schema.Types.ObjectId, ref: "Company" },

    // Status
    status: {
      type: String,
      enum: ["active", "invited", "inactive", "pending", "suspended"],
      default: "pending",
    },
    accessStatus: {
      type: String,
      enum: ["registered", "pending", "not_registered"],
      default: "not_registered",
    },
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },

    profileImage: {
      type: profileImageSchema || String,
      default: null,
    },
    avatar: { type: String },

    // Assignments
    assignedManager: { type: Schema.Types.ObjectId, ref: "User" },
    assignedCustomer: { type: Schema.Types.ObjectId, ref: "Customer" },
    assignedLocation: { type: Schema.Types.ObjectId, ref: "Location" },
    assignedLocations: [{ type: Schema.Types.ObjectId, ref: "Location" }],
    assignedCustomers: [{ type: Schema.Types.ObjectId, ref: "Customer" }],
    assignedEmployees: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Roles & Permissions
    customRoles: [{ type: Schema.Types.ObjectId, ref: "Role" }],

    // Security (mobile app)
    pin: { type: String },
    biometricEnabled: { type: Boolean, default: false },
    autoLockMinutes: { type: Number, default: 5 },

    // Preferences
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    languagePreference: { type: String, enum: ["en", "nl", "de"], default: "en" },

    fcmToken: { type: [String], default: [] },
    
    // Auth boilerplate fields
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    passwordChangedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  // Compute name and initials if not provided but firstName and lastName are present
  if (this.isModified("firstName") || this.isModified("lastName")) {
    if (this.firstName && this.lastName) {
      this.name = `${this.firstName} ${this.lastName}`;
      this.initials = `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
    }
  }

  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.statics.isUserExistByEmail = async function (email: string) {
  return this.findOne({ email, isDeleted: false }).select("+password");
};

userSchema.statics.isUserExistByCustomId = async function (email: string) {
  return this.findOne({ email });
};

userSchema.statics.compareUserPassword = async function (
  payloadPassword: string,
  hashedPassword: string,
) {
  return bcrypt.compare(payloadPassword, hashedPassword);
};

userSchema.statics.newHashedPassword = async function (newPassword: string) {
  return bcrypt.hash(newPassword, 10);
};

userSchema.statics.isOldTokenValid = async function (
  passwordChangedTime: Date,
  jwtIssuedTime: number,
) {
  if (!passwordChangedTime) return false;
  const passwordChangedTimestamp = Math.floor(passwordChangedTime.getTime() / 1000);
  return passwordChangedTimestamp > jwtIssuedTime;
};

userSchema.statics.isJwtIssuedBeforePasswordChange = function (
  passwordChangeTimeStamp: Date,
  jwtIssuedTimeStamp: number,
) {
  if (!passwordChangeTimeStamp) return false;

  const passwordChangedTime =
    Math.floor(new Date(passwordChangeTimeStamp).getTime() / 1000);

  return passwordChangedTime > jwtIssuedTimeStamp;
};

export const UserModel = model<IUser, UserInterface>("User", userSchema);
