import { Model, Types } from "mongoose";

export interface IReportField {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "dropdown";
  options?: string[]; // for dropdown
  required: boolean;
}

export interface IReportTemplate {
  _id?: Types.ObjectId;
  company: Types.ObjectId;
  
  name: string; // e.g., "Duty Report", "Incident Report"
  description?: string;
  
  type: "duty_report" | "round_report" | "incident_report" | "custom_report";
  
  fields: IReportField[];
  
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReportTemplateInterface extends Model<IReportTemplate> {}
