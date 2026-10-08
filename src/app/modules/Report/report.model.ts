import { Schema, model } from "mongoose";
import { IReport, ReportInterface } from "./report.interface";

const verificationDataSchema = new Schema(
  {
    gpsLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      isVerified: { type: Boolean, default: true },
    },
    nfcCheckpoint: { type: Schema.Types.ObjectId, ref: "NfcCheckpoint" },
    originalTimestamp: { type: Date, default: Date.now },
    deviceId: { type: String },
  },
  { _id: false }
);

const reportSchema = new Schema<IReport, ReportInterface>(
  {
    reportId: { type: String, unique: true },
    type: {
      type: String,
      enum: ["duty", "round", "incident", "custom", "maintenance", "general", "customer"],
      required: true,
      default: "incident",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "returned", "open", "in_progress", "resolved", "closed"],
      default: "submitted",
    },
    
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedReviewer: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewComments: { type: String },
    
    attachments: [{ type: String }],
    verificationData: { type: verificationDataSchema },
    
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

reportSchema.statics.generateReportId = async function () {
  const latestReport = await this.findOne().sort({ createdAt: -1 });
  let nextId = 10001;
  
  if (latestReport && latestReport.reportId) {
    const idParts = latestReport.reportId.split("-");
    if (idParts.length === 2 && !isNaN(parseInt(idParts[1]))) {
      nextId = parseInt(idParts[1]) + 1;
    }
  }
  return `REP-${nextId}`;
};

reportSchema.pre("save", async function () {
  if (!this.reportId) {
    this.reportId = await (this.constructor as any).generateReportId();
  }
});

export const ReportModel = model<IReport, ReportInterface>("Report", reportSchema);
