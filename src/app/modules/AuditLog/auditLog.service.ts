import { AuditLogModel } from "./auditLog.model";
import { IAuditLog } from "./auditLog.interface";
import QueryBuilder from "../../../builder/QueryBuilder";

const createLog = async (payload: Partial<IAuditLog>) => {
  // Silent fire-and-forget logging
  try {
    await AuditLogModel.create(payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to create audit log", error);
  }
};

const getCompanyLogs = async (companyId: string, query: Record<string, unknown>) => {
  const logQuery = new QueryBuilder(
    AuditLogModel.find({ company: companyId }).populate("user", "firstName lastName email"),
    query
  )
    .search(["action", "entityType", "details"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const logs = await logQuery.modelQuery;
  const meta = await logQuery.countTotal();

  return { logs, meta };
};

const getGlobalLogs = async (query: Record<string, unknown>) => {
  const logQuery = new QueryBuilder(
    AuditLogModel.find().populate("user", "firstName lastName").populate("company", "name"),
    query
  )
    .search(["action", "entityType", "details"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const logs = await logQuery.modelQuery;
  const meta = await logQuery.countTotal();

  return { logs, meta };
};

export const AuditLogServices = {
  createLog,
  getCompanyLogs,
  getGlobalLogs
};
