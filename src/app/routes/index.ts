import { Router } from "express";
import { userRoutes } from "../modules/User/user.routes";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { notificationRoutes } from "../modules/Notification/notification.route";
import { conversationRoutes } from "../modules/Conversation/conversation.route";
import { messageRoutes } from "../modules/Message/message.route";
import { AboutRoutes } from "../modules/Settings/About/About.route";
import { PrivacyRoutes } from "../modules/Settings/privacy/Privacy.route";
import { TermsRoutes } from "../modules/Settings/Terms/Terms.route";
import { CompanyRoutes } from "../modules/Company/company.route";
import { CustomerRoutes } from "../modules/Customer/customer.route";
import { LocationRoutes } from "../modules/Location/location.route";
import { NfcRoutes } from "../modules/NfcCheckpoint/nfc.route";
import { SuperAdminRoutes } from "../modules/SuperAdmin/superadmin.route";
import { PatrolRoutesRoutes } from "../modules/PatrolRoute/patrolRoute.route";
import { CompanyAdminRoutes } from "../modules/CompanyAdmin/companyAdmin.route";
import { WorkSessionRoutes } from "../modules/WorkSession/workSession.route";
import { ReportRoutes } from "../modules/Report/report.route";
import { TaskRoutes } from "../modules/Task/task.route";
import { PatrolExecutionRoutes } from "../modules/PatrolExecution/patrolExecution.route";
import { CustomRoleRoutes } from "../modules/CustomRole/customRole.route";
import { DocumentRoutes } from "../modules/Document/document.route";
import { AnnouncementRoutes } from "../modules/Announcement/announcement.route";

// Newly added
import { DeviceRoutes } from "../modules/Device/device.route";
import { ShiftRoutes } from "../modules/Shift/shift.route";
import { ReportTemplateRoutes } from "../modules/ReportTemplate/reportTemplate.route";
import { TrainingRecordRoutes } from "../modules/TrainingRecord/trainingRecord.route";
import { SubscriptionPlanRoutes } from "../modules/SubscriptionPlan/subscriptionPlan.route";
import { PaymentRoutes } from "../modules/Payment/payment.route";
import { AIRoutes } from "../modules/AI/ai.route";
import { AuditLogRoutes } from "../modules/AuditLog/auditLog.route";
import { SupportTicketRoutes } from "../modules/SupportTicket/supportTicket.route";
import { ManagerRoutes } from "../modules/Manager/manager.route";
import { EmployeeRoutes } from "../modules/Employee/employee.route";
import { SystemSettingsRoutes } from "../modules/Settings/SystemSettings/systemSettings.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/super-admin",
    route: SuperAdminRoutes,
  },
  {
    path: "/company-admin",
    route: CompanyAdminRoutes,
  },
  {
    path: "/manager",
    route: ManagerRoutes,
  },
  {
    path: "/employee",
    route: EmployeeRoutes,
  },
  {
    path: "/companies",
    route: CompanyRoutes,
  },
  {
    path: "/customers",
    route: CustomerRoutes,
  },
  {
    path: "/locations",
    route: LocationRoutes,
  },
  {
    path: "/nfc-checkpoints",
    route: NfcRoutes,
  },
  {
    path: "/patrol-routes",
    route: PatrolRoutesRoutes,
  },
  {
    path: "/patrol-executions",
    route: PatrolExecutionRoutes,
  },
  {
    path: "/work-sessions",
    route: WorkSessionRoutes,
  },
  {
    path: "/reports",
    route: ReportRoutes,
  },
  {
    path: "/tasks",
    route: TaskRoutes,
  },
  {
    path: "/custom-roles",
    route: CustomRoleRoutes,
  },
  {
    path: "/documents",
    route: DocumentRoutes,
  },
  {
    path: "/announcements",
    route: AnnouncementRoutes,
  },
  {
    path: "/devices",
    route: DeviceRoutes,
  },
  {
    path: "/shifts",
    route: ShiftRoutes,
  },
  {
    path: "/report-templates",
    route: ReportTemplateRoutes,
  },
  {
    path: "/training-records",
    route: TrainingRecordRoutes,
  },
  {
    path: "/subscription-plans",
    route: SubscriptionPlanRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/ai",
    route: AIRoutes,
  },
  {
    path: "/audit-logs",
    route: AuditLogRoutes,
  },
  {
    path: "/support-tickets",
    route: SupportTicketRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/notifications",
    route: notificationRoutes,
  },
  {
    path: "/notification", // backward compatibility alias
    route: notificationRoutes,
  },
  {
    path: "/conversations",
    route: conversationRoutes,
  },
  {
    path: "/messages",
    route: messageRoutes,
  },
  {
    path: "/settings/about",
    route: AboutRoutes,
  },
  {
    path: "/settings/privacy",
    route: PrivacyRoutes,
  },
  {
    path: "/settings/terms",
    route: TermsRoutes,
  },
  {
    path: "/system-settings",
    route: SystemSettingsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
