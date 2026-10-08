import config from "../config";
import { AboutModel } from "../modules/Settings/About/About.model";
import { PrivacyModel } from "../modules/Settings/privacy/Privacy.model";
import { TermsModel } from "../modules/Settings/Terms/Terms.model";
import { UserModel } from "../modules/User/user.model";
import { CompanyModel } from "../modules/Company/company.model";
import { SubscriptionPlanModel } from "../modules/SubscriptionPlan/subscriptionPlan.model";

import { IUser } from "../modules/User/user.interface";

const dummyPrivacy = {
  description: "Default Privacy Policy. Update via Admin Settings.",
};
const dummyAbout = {
  description: "Default About Us. Update via Admin Settings.",
};
const dummyTerms = {
  description: "Default Terms and Conditions. Update via Admin Settings.",
};

const admin: Partial<IUser> = {
  email: config.ADMIN_EMAIL as string,
  password: config.ADMIN_PASS as string,
  role: "admin",
  isVerified: true,
  status: "active",
};

const superAdmin: Partial<IUser> = {
  email: config.SUPER_ADMIN_EMAIL as string,
  password: config.SUPER_ADMIN_PASS as string,
  role: "super_admin",
  isVerified: true,
  status: "active",
};

export const seedAdmin = async () => {
  try {
    if (!admin.email || !admin.password) return;
    const isAdminExist = await UserModel.findOne({ email: admin.email });
    if (!isAdminExist) {
      await UserModel.create(admin);
      console.log("Admin created successfully.");
    }
  } catch (error) {
    console.error("Error seeding Admin:", error);
  }
};

export const seedSuperAdmin = async () => {
  try {
    if (!superAdmin.email || !superAdmin.password) return;
    const isSuperAdminExist = await UserModel.findOne({ email: superAdmin.email });
    if (!isSuperAdminExist) {
      await UserModel.create(superAdmin);
      console.log("Super admin created successfully.");
    }
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};

export const seedSubscriptionPlans = async () => {
  try {
    const plans = [
      {
        name: "Starter",
        price: 49,
        billingPeriod: "monthly" as const,
        features: ["Up to 25 employees", "NFC checkpoints", "Standard reports"],
        maxEmployees: 25,
        maxLocations: 5,
        isActive: true,
      },
      {
        name: "Professional",
        price: 99,
        billingPeriod: "monthly" as const,
        features: ["Up to 100 employees", "NFC checkpoints & patrols", "Live GPS tracking", "AI assistant"],
        maxEmployees: 100,
        maxLocations: 25,
        isActive: true,
      },
      {
        name: "Enterprise",
        price: 249,
        billingPeriod: "monthly" as const,
        features: ["Unlimited employees", "Full platform access", "Priority support", "Customer portal"],
        maxEmployees: 500,
        maxLocations: 100,
        isActive: true,
      },
    ];

    for (const plan of plans) {
      const exists = await SubscriptionPlanModel.findOne({ name: plan.name });
      if (!exists) {
        await SubscriptionPlanModel.create(plan);
      }
    }
    console.log("Subscription plans seeded successfully.");
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
  }
};

export const seedDemoUsers = async () => {
  try {
    // 1. Create a dummy Company first
    let company = await CompanyModel.findOne({
      $or: [
        { contactEmail: "company_admin@shiftpoint.com" },
        { contactEmail: "admin@shiftpoint-demo.com" },
        { name: "ShiftPoint Demo Company" }
      ]
    });
    if (!company) {
      company = await CompanyModel.create({
        name: "ShiftPoint Demo Company",
        contactEmail: "company_admin@shiftpoint.com",
        sector: "security",
        isActive: true,
        setupProgress: {
          companyProfile: true,
          customers: true,
          locations: true,
          employees: true,
          rolesPermissions: true,
          nfcCheckpoints: true,
          patrolRoutes: true,
          tasksChecklists: true,
          reportTemplates: true,
        },
      });
      console.log("Demo Company seeded successfully.");
    }

    // 2. Seed Company Admin
    const companyAdmin: Partial<IUser> = {
      firstName: "Company",
      lastName: "Admin",
      email: "company_admin@shiftpoint.com",
      password: "password123",
      role: "company_admin",
      company: company._id as import("mongoose").Types.ObjectId,
      isVerified: true,
      status: "active",
    };
    if (!(await UserModel.findOne({ email: companyAdmin.email }))) {
      await UserModel.create(companyAdmin);
      console.log("Demo Company Admin seeded.");
    }

    // 3. Seed Manager
    const manager: Partial<IUser> = {
      firstName: "John",
      lastName: "Smith",
      email: "manager@shiftpoint.com",
      password: "password123",
      role: "manager",
      company: company._id as import("mongoose").Types.ObjectId,
      employeeId: "MGR-001",
      isVerified: true,
      status: "active",
    };
    let managerDoc = await UserModel.findOne({ email: manager.email });
    if (!managerDoc) {
      managerDoc = await UserModel.create(manager);
      console.log("Demo Manager seeded.");
    }

    // 4. Seed Employee
    const employee: Partial<IUser> = {
      firstName: "Daan",
      lastName: "Vermeer",
      email: "employee@shiftpoint.com",
      password: "password123",
      role: "employee",
      company: company._id as import("mongoose").Types.ObjectId,
      employeeId: "EMP-1024",
      assignedManager: managerDoc?._id as import("mongoose").Types.ObjectId,
      isVerified: true,
      status: "active",
    };
    let employeeDoc = await UserModel.findOne({ email: employee.email });
    if (!employeeDoc) {
      employeeDoc = await UserModel.create(employee);
      console.log("Demo Employee seeded.");
    }

    // 5. Seed Operational Data for Dashboard Testing
    const LocationModel = (await import("../modules/Location/location.model")).LocationModel;
    const CustomerModel = (await import("../modules/Customer/customer.model")).CustomerModel;
    const NfcModel = (await import("../modules/NfcCheckpoint/nfc.model")).NfcCheckpointModel;
    const PatrolRouteModel = (await import("../modules/PatrolRoute/patrolRoute.model")).PatrolRouteModel;
    const TaskModel = (await import("../modules/Task/task.model")).TaskModel;
    const WorkSessionModel = (await import("../modules/WorkSession/workSession.model")).WorkSessionModel;
    const ReportModel = (await import("../modules/Report/report.model")).ReportModel;

    let customer = await CustomerModel.findOne({ company: company._id });
    if (!customer) {
      customer = await CustomerModel.create({
        companyName: "Acme Corp (Demo Client)",
        company: company._id,
        generalEmail: "contact@acmecorp.demo",
        isActive: true,
      });
      console.log("Demo Customer seeded.");
    }

    let location = await LocationModel.findOne({ company: company._id });
    if (!location) {
      location = await LocationModel.create({
        name: "Acme HQ - Amsterdam",
        company: company._id,
        customer: customer._id,
        isActive: true,
      });
      console.log("Demo Location seeded.");
    }

    let nfc = await NfcModel.findOne({ company: company._id });
    if (!nfc) {
      nfc = await NfcModel.create({
        tagId: "04:6A:B2:Demo:01",
        name: "Main Entrance Checkpoint",
        company: company._id,
        location: location._id,
        customer: customer._id,
        status: "active",
      });
      console.log("Demo NFC Checkpoint seeded.");
    }

    let route = await PatrolRouteModel.findOne({ company: company._id });
    if (!route) {
      route = await PatrolRouteModel.create({
        name: "Perimeter Check",
        company: company._id,
        location: location._id,
        checkpoints: [{ checkpoint: nfc._id, order: 1, mandatory: true }],
        isActive: true,
      });
      console.log("Demo Patrol Route seeded.");
    }

    let task = await TaskModel.findOne({ company: company._id });
    if (!task) {
      task = await TaskModel.create({
        title: "Check Fire Extinguishers",
        type: "security_check",
        company: company._id,
        location: location._id,
        createdBy: managerDoc._id,
        assignedTo: employeeDoc._id,
        status: "pending",
        isActive: true,
      });
      console.log("Demo Task seeded.");
    }

    let report = await ReportModel.findOne({ company: company._id });
    if (!report) {
      report = await ReportModel.create({
        title: "Broken window at main entrance",
        description: "Glass is shattered, needs immediate replacement.",
        type: "incident",
        priority: "high",
        author: employeeDoc._id,
        company: company._id,
        location: location._id,
        status: "open",
        isActive: true,
      });
      console.log("Demo Report seeded.");
    }

    let session = await WorkSessionModel.findOne({ company: company._id });
    if (!session) {
      session = await WorkSessionModel.create({
        user: employeeDoc._id,
        company: company._id,
        location: location._id,
        clockInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        status: "active",
      });
      console.log("Demo WorkSession seeded.");
    }

  } catch (error) {
    console.error("Error seeding demo users:", error);
  }
};

export const seedPrivacy = async () => {
  try {
    const privacy = await PrivacyModel.findOne();
    if (!privacy) {
      await PrivacyModel.create(dummyPrivacy);
      console.log("Privacy policy seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding privacy policy:", error);
  }
};

export const seedTerms = async () => {
  try {
    const terms = await TermsModel.findOne();
    if (!terms) {
      await TermsModel.create(dummyTerms);
      console.log("Terms and conditions seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding terms and conditions:", error);
  }
};

export const seedAbout = async () => {
  try {
    const about = await AboutModel.findOne();
    if (!about) {
      await AboutModel.create(dummyAbout);
      console.log("About us seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding about us:", error);
  }
};
