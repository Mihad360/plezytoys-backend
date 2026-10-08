import { Schema, model } from "mongoose";
import { IReportTemplate, ReportTemplateInterface } from "./reportTemplate.interface";

const fieldSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "boolean", "date", "dropdown"], required: true },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const reportTemplateSchema = new Schema<IReportTemplate, ReportTemplateInterface>(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    
    name: { type: String, required: true },
    description: { type: String },
    
    type: {
      type: String,
      enum: ["duty_report", "round_report", "incident_report", "custom_report"],
      required: true,
    },
    
    fields: [fieldSchema],
    
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const ReportTemplateModel = model<IReportTemplate, ReportTemplateInterface>("ReportTemplate", reportTemplateSchema);
