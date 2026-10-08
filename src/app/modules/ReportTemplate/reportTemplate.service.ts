import HttpStatus from "http-status";
import AppError from "../../erros/AppError";
import { ReportTemplateModel } from "./reportTemplate.model";
import { IReportTemplate } from "./reportTemplate.interface";

const createReportTemplate = async (companyId: string, payload: Partial<IReportTemplate>) => {
  const newTemplate = await ReportTemplateModel.create({
    ...payload,
    company: companyId,
  });
  return newTemplate;
};

const getCompanyReportTemplates = async (companyId: string) => {
  return await ReportTemplateModel.find({ company: companyId, isActive: true });
};

const updateReportTemplate = async (id: string, companyId: string, payload: Partial<IReportTemplate>) => {
  const template = await ReportTemplateModel.findOne({ _id: id, company: companyId });
  if (!template) {
    throw new AppError(HttpStatus.NOT_FOUND, "Template not found");
  }

  return await ReportTemplateModel.findByIdAndUpdate(id, { $set: payload }, { new: true });
};

export const ReportTemplateServices = {
  createReportTemplate,
  getCompanyReportTemplates,
  updateReportTemplate
};
