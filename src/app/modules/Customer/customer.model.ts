/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from "mongoose";
import { ICustomer, CustomerInterface } from "./customer.interface";

const portalConfigSchema = new Schema(
  {
    allowedReportTypes: [{ type: String }],
    permissions: {
      reports: [{ type: String, enum: ["view", "download", "comment", "approve"] }],
      tasks: { type: Boolean, default: false },
      attendance: { type: Boolean, default: false },
      announcements: { type: Boolean, default: false },
    },
    locationScope: [{ type: Schema.Types.ObjectId, ref: "Location" }],
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    streetAddress: { type: String },
    postalCode: { type: String },
    city: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const customerSchema = new Schema<ICustomer, CustomerInterface>(
  {
    customerId: { type: String, unique: true },
    companyName: { type: String, required: true, trim: true },
    customerReference: { type: String, trim: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    generalEmail: { type: String, trim: true },
    
    address: { type: addressSchema },
    
    businessRegistrationNumber: { type: String, trim: true },
    vatNumber: { type: String, trim: true },
    internalNotes: { type: String },
    
    portalStatus: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "disabled",
    },
    portalConfig: { type: portalConfigSchema, default: () => ({}) },
    
    locationsCount: { type: Number, default: 0 },
    employeesCount: { type: Number, default: 0 },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

customerSchema.statics.generateCustomerId = async function () {
  const latestCustomer = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestCustomer && latestCustomer.customerId) {
    const idParts = latestCustomer.customerId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `CUS-${nextId}`;
};

customerSchema.pre("save", async function () {
  if (!this.customerId) {
    this.customerId = await (this.constructor as any).generateCustomerId();
  }
});

export const CustomerModel = model<ICustomer, CustomerInterface>("Customer", customerSchema);
