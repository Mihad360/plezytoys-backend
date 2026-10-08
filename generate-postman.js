const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    name: "ShiftPoint Platform API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrlLocal", value: "https://mihad3000.ssh.bd/api/v1" },
    { key: "superAdminToken", value: "" },
    { key: "companyAdminToken", value: "" },
    { key: "managerToken", value: "" },
    { key: "employeeToken", value: "" },
    { key: "resetToken", value: "" },
    { key: "activeLocationId", value: "6ac5d3b472cd040854d47652" },
    { key: "taskId", value: "6ac7176cd1c11f9437f6f692" },
    { key: "checklistItemId", value: "6ac717a308ff5140811cda8c" },
    { key: "notificationId", value: "" },
    { key: "patrolRouteId", value: "6ac5d5b072cd040854d47656" },
    { key: "patrolExecutionId", value: "" }
  ],
  item: []
};

// 0. Dedicated Mobile App Flow Folder (Matching Screenshots 105337, 105416, 105430, 105445)
const mobileAppFlowFolder = {
  name: "00. Mobile App Flow (Screenshots 1 - 4 Complete)",
  item: [
    {
      name: "Step 01: Sign In (Employee Credentials)",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "if (jsonData && jsonData.data && jsonData.data.accessToken) {",
              "    pm.collectionVariables.set('employeeToken', `Bearer ${jsonData.data.accessToken}`);",
              "    console.log('Employee token set successfully.');",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            email: "employee@shiftpoint.com",
            password: "your_password"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/login", host: ["{{baseUrlLocal}}"], path: ["auth", "login"] }
      }
    },
    {
      name: "Step 02: Secure Your Account (Biometrics & Auto-lock)",
      request: {
        method: "PATCH",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            biometricEnabled: true,
            autoLockMinutes: 5
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/security-settings", host: ["{{baseUrlLocal}}"], path: ["auth", "security-settings"] }
      }
    },
    {
      name: "Step 03: Create Security PIN (6-digit quick access)",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            pin: "123456"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/set-pin", host: ["{{baseUrlLocal}}"], path: ["auth", "set-pin"] }
      }
    },
    {
      name: "Step 04: Register Device (Trust Device)",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            deviceName: "iPhone 15 Pro",
            deviceId: "DEV-IPHONE15-001"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/devices/register", host: ["{{baseUrlLocal}}"], path: ["devices", "register"] }
      }
    },
    {
      name: "Step 05: Verify My Registered Devices",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/devices/me", host: ["{{baseUrlLocal}}"], path: ["devices", "me"] }
      }
    },
    {
      name: "Step 06a: Forgot Password - Request OTP",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            email: "employee@shiftpoint.com"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/forget-password", host: ["{{baseUrlLocal}}"], path: ["auth", "forget-password"] }
      }
    },
    {
      name: "Step 06b: Enter OTP - Verify Reset Code",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "if (jsonData && jsonData.data && jsonData.data.accessToken) {",
              "    pm.collectionVariables.set('resetToken', `Bearer ${jsonData.data.accessToken}`);",
              "    console.log('Reset token captured for password change.');",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            email: "employee@shiftpoint.com",
            otp: "123456"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/verify-otp", host: ["{{baseUrlLocal}}"], path: ["auth", "verify-otp"] }
      }
    },
    {
      name: "Step 06c: Setup New Password",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{resetToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            newPassword: "your_password"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/reset-password", host: ["{{baseUrlLocal}}"], path: ["auth", "reset-password"] }
      }
    },
    {
      name: "Step 07: Employee App Home Summary (Daan Vermeer EMP-1024)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/home-summary", host: ["{{baseUrlLocal}}"], path: ["employee", "home-summary"] }
      }
    },
    {
      name: "Step 08: Authorized Locations (Geofence & Coords)",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "if (jsonData && jsonData.data && jsonData.data.length > 0) {",
              "    const loc = jsonData.data[0];",
              "    pm.collectionVariables.set('activeLocationId', loc.locationId || loc._id);",
              "    console.log('Set activeLocationId:', loc.locationId || loc._id);",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/locations", host: ["{{baseUrlLocal}}"], path: ["employee", "locations"] }
      }
    },
    {
      name: "Step 09: Clock In with GPS Verification (Amsterdam North DC)",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            location: "{{activeLocationId}}",
            clockInLocation: {
              latitude: 52.370216,
              longitude: 4.895168,
              accuracy: 6
            },
            deviceInfo: "iPhone 15 Pro"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/work-sessions/clock-in", host: ["{{baseUrlLocal}}"], path: ["work-sessions", "clock-in"] }
      }
    },
    {
      name: "Step 10: View Active Work Session (Elapsed Time & Status)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/work-sessions/active", host: ["{{baseUrlLocal}}"], path: ["work-sessions", "active"] }
      }
    },
    {
      name: "Step 11: Re-fetch Home Summary (Now Shows Active Session Card)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/home-summary", host: ["{{baseUrlLocal}}"], path: ["employee", "home-summary"] }
      }
    },
    {
      name: "Step 12: In-App Notifications List (All / Unread filter)",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "if (jsonData && jsonData.data && jsonData.data.length > 0) {",
              "    pm.collectionVariables.set('notificationId', jsonData.data[0]._id);",
              "    console.log('Set notificationId:', jsonData.data[0]._id);",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/notification", host: ["{{baseUrlLocal}}"], path: ["notification"] }
      }
    },
    {
      name: "Step 13: In-App Notification Unread Count Badge",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/notification/unread-count", host: ["{{baseUrlLocal}}"], path: ["notification", "unread-count"] }
      }
    },
    {
      name: "Step 14: Mark Single Notification as Read",
      request: {
        method: "PATCH",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/notification/{{notificationId}}/read", host: ["{{baseUrlLocal}}"], path: ["notification", "{{notificationId}}", "read"] }
      }
    },
    {
      name: "Step 15: Mark All Notifications as Read",
      request: {
        method: "PATCH",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/notification/read-all", host: ["{{baseUrlLocal}}"], path: ["notification", "read-all"] }
      }
    },
    {
      name: "Step 16: Today's Tasks List (Status filter: all / assigned)",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "if (jsonData && jsonData.data && jsonData.data.length > 0) {",
              "    const equipTask = jsonData.data.find(t => t.title.includes('Equipment')) || jsonData.data[0];",
              "    pm.collectionVariables.set('taskId', equipTask._id);",
              "    if (equipTask.checklist && equipTask.checklist.length > 0) {",
              "        pm.collectionVariables.set('checklistItemId', equipTask.checklist[0]._id);",
              "    }",
              "    console.log('Selected taskId:', equipTask._id);",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/tasks", host: ["{{baseUrlLocal}}"], path: ["tasks"] }
      }
    },
    {
      name: "Step 17: View Task Details (Daily Equipment Check Preview)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/tasks/{{taskId}}", host: ["{{baseUrlLocal}}"], path: ["tasks", "{{taskId}}"] }
      }
    },
    {
      name: "Step 18: Toggle Checklist Item Progress",
      request: {
        method: "PATCH",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            isCompleted: true
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/tasks/{{taskId}}/checklist/{{checklistItemId}}", host: ["{{baseUrlLocal}}"], path: ["tasks", "{{taskId}}", "checklist", "{{checklistItemId}}"] }
      }
    },
    {
      name: "Step 19: Submit Task for Review with Evidence & Notes",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            attachments: [
              {
                fileUrl: "https://shiftpoint-storage.s3.amazonaws.com/evidence/Photo_001.jpg",
                type: "photo"
              }
            ],
            completionNotes: "All equipment inspected. Entrance and communication devices checked and functioning normally."
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/tasks/{{taskId}}/submit", host: ["{{baseUrlLocal}}"], path: ["tasks", "{{taskId}}", "submit"] }
      }
    },
    {
      name: "Step 20: Quick Actions - Start Patrol Route",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "if (jsonData && jsonData.data && jsonData.data._id) {",
              "    pm.collectionVariables.set('patrolExecutionId', jsonData.data._id);",
              "    console.log('Set patrolExecutionId:', jsonData.data._id);",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            routeId: "{{patrolRouteId}}"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/patrol-executions/start", host: ["{{baseUrlLocal}}"], path: ["patrol-executions", "start"] }
      }
    },
    {
      name: "Step 21: View Active Patrol Round",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/patrol-executions/active", host: ["{{baseUrlLocal}}"], path: ["patrol-executions", "active"] }
      }
    },
    {
      name: "Step 22: Finish Patrol Round",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            notes: "Routine perimeter check finished without incidents."
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/patrol-executions/{{patrolExecutionId}}/finish", host: ["{{baseUrlLocal}}"], path: ["patrol-executions", "{{patrolExecutionId}}", "finish"] }
      }
    },
    {
      name: "Step 23: Confirm Clock Out (End Shift)",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            clockOutLocation: {
              latitude: 52.370216,
              longitude: 4.895168
            },
            notes: "Completed shift safely and on schedule."
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/work-sessions/clock-out", host: ["{{baseUrlLocal}}"], path: ["work-sessions", "clock-out"] }
      }
    },
    {
      name: "Step 24: View My Work History (Completed Sessions)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/work-sessions/me", host: ["{{baseUrlLocal}}"], path: ["work-sessions", "me"] }
      }
    },
    {
      name: "Step 25: Offline Batch Sync (Pending Queue Items)",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            items: [
              {
                type: "scan",
                timestamp: new Date().toISOString(),
                payload: { checkpointId: "CP-001", latitude: 52.3702, longitude: 4.8951 }
              }
            ]
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/employee/sync", host: ["{{baseUrlLocal}}"], path: ["employee", "sync"] }
      }
    }
  ]
};
collection.item.push(mobileAppFlowFolder);

// 1. Auth Folder with Test Scripts for Tokens
const authFolder = {
  name: "Auth",
  item: [
    {
      name: "Login",
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "const jsonData = pm.response.json();",
              "const bearerToken = `Bearer ${jsonData.data.accessToken}`;",
              "if (jsonData && jsonData.data.accessToken) {",
              "    const role = jsonData.data.user?.role || 'company_admin';",
              "    if (role === 'super_admin') pm.collectionVariables.set('superAdminToken', bearerToken);",
              "    else if (role === 'company_admin') pm.collectionVariables.set('companyAdminToken', bearerToken);",
              "    else if (role === 'manager') pm.collectionVariables.set('managerToken', bearerToken);",
              "    else if (role === 'employee') pm.collectionVariables.set('employeeToken', bearerToken);",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ],
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            email: "superadmin@shiftpoint.com",
            password: "your_password"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/login", host: ["{{baseUrlLocal}}"], path: ["auth", "login"] }
      }
    },
    {
      name: "Login with PIN (Mobile App)",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            identifier: "EMP-1024",
            pin: "123456"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/login-pin", host: ["{{baseUrlLocal}}"], path: ["auth", "login-pin"] }
      }
    },
    {
      name: "Set Security PIN",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            pin: "123456"
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/set-pin", host: ["{{baseUrlLocal}}"], path: ["auth", "set-pin"] }
      }
    },
    {
      name: "Update Security Settings",
      request: {
        method: "PATCH",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            biometricEnabled: true,
            autoLockMinutes: 5
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/auth/security-settings", host: ["{{baseUrlLocal}}"], path: ["auth", "security-settings"] }
      }
    }
  ]
};
collection.item.push(authFolder);

// Manager Dedicated Endpoints
const managerFolder = {
  name: "Manager",
  item: [
    {
      name: "Get Dashboard Stats & Attention Alerts",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{managerToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/manager/dashboard-stats?locationId=all", host: ["{{baseUrlLocal}}"], path: ["manager", "dashboard-stats"], query: [{ key: "locationId", value: "all" }] }
      }
    },
    {
      name: "Get Assigned Locations",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{managerToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/manager/locations", host: ["{{baseUrlLocal}}"], path: ["manager", "locations"] }
      }
    },
    {
      name: "Get Employees Live Status",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{managerToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/manager/employees", host: ["{{baseUrlLocal}}"], path: ["manager", "employees"] }
      }
    },
    {
      name: "Get Attention Required Alerts",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{managerToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/manager/alerts", host: ["{{baseUrlLocal}}"], path: ["manager", "alerts"] }
      }
    },
    {
      name: "Get Live Attendance",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{managerToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/manager/attendance", host: ["{{baseUrlLocal}}"], path: ["manager", "attendance"] }
      }
    }
  ]
};
collection.item.push(managerFolder);

// Employee Dedicated Endpoints (Mobile App & Web Dashboard)
const employeeFolder = {
  name: "Employee",
  item: [
    {
      name: "Get App Home Summary (Clock-In Status, Shift, Next Up)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/home-summary", host: ["{{baseUrlLocal}}"], path: ["employee", "home-summary"] }
      }
    },
    {
      name: "Get Operational History (Timeline)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/history?filter=all", host: ["{{baseUrlLocal}}"], path: ["employee", "history"], query: [{ key: "filter", value: "all" }] }
      }
    },
    {
      name: "Get Authorized Locations",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/locations", host: ["{{baseUrlLocal}}"], path: ["employee", "locations"] }
      }
    },
    {
      name: "Batch Offline Sync",
      request: {
        method: "POST",
        header: [
          { key: "Authorization", value: "{{employeeToken}}", type: "text" },
          { key: "Content-Type", value: "application/json" }
        ],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            items: []
          }, null, 4),
          options: { raw: { language: "json" } }
        },
        url: { raw: "{{baseUrlLocal}}/employee/sync", host: ["{{baseUrlLocal}}"], path: ["employee", "sync"] }
      }
    },
    {
      name: "Get Next Auto Employee ID (Serial Generator)",
      request: {
        method: "GET",
        header: [{ key: "Authorization", value: "{{employeeToken}}", type: "text" }],
        url: { raw: "{{baseUrlLocal}}/employee/next-employee-id", host: ["{{baseUrlLocal}}"], path: ["employee", "next-employee-id"] }
      }
    }
  ]
};
collection.item.push(employeeFolder);

// Standard CRUD Modules
const modules = [
  { name: "SuperAdmin", path: "super-admin", endpoints: ["GET /users", "PATCH /role/update/:id", "GET /dashboard-stats", "GET /dashboard-charts", "GET /trials", "POST /trials/activate-pilot"] },
  { name: "CompanyAdmin", path: "company-admin", endpoints: ["GET /dashboard-stats", "GET /charts", "GET /employees", "GET /working-time"] },
  { name: "Companies", path: "companies", endpoints: ["GET /", "POST /", "POST /:companyId/admin", "GET /my-company", "GET /:id", "PATCH /:id", "PATCH /:id/modules", "DELETE /:id"] },
  { name: "Customers", path: "customers" },
  { name: "Locations", path: "locations" },
  { name: "NfcCheckpoints", path: "nfc-checkpoints" },
  { name: "PatrolRoutes", path: "patrol-routes" },
  { name: "PatrolExecutions", path: "patrol-executions", endpoints: ["POST /start", "GET /active", "POST /:id/scan", "POST /:id/missed-checkpoint", "POST /:id/finish", "GET /"] },
  { name: "WorkSessions", path: "work-sessions", endpoints: ["POST /clock-in", "POST /clock-out", "GET /active", "POST /heartbeat", "GET /me", "GET /"] },
  { name: "Tasks", path: "tasks", endpoints: ["GET /", "POST /", "GET /:id", "PATCH /:id", "POST /:id/submit", "POST /:id/review", "PATCH /:id/checklist/:itemId"] },
  { name: "Reports", path: "reports", endpoints: ["GET /", "POST /", "GET /:id", "PATCH /:id", "POST /:id/review"] },
  { name: "CustomRoles", path: "custom-roles" },
  { name: "Documents", path: "documents" },
  { name: "Announcements", path: "announcements" },
  { name: "Devices", path: "devices" },
  { name: "Shifts", path: "shifts" },
  { name: "ReportTemplates", path: "report-templates" },
  { name: "TrainingRecords", path: "training-records" },
  { name: "SubscriptionPlans", path: "subscription-plans" },
  { name: "Payments", path: "payments" },
  { name: "AI", path: "ai", endpoints: ["POST /knowledge-sources", "GET /knowledge-sources", "POST /ask", "GET /unresolved-questions", "PATCH /unresolved-questions/:id"] },
  { name: "AuditLogs", path: "audit-logs", endpoints: ["GET /", "GET /company"] },
  { name: "SupportTickets", path: "support-tickets", endpoints: ["GET /", "POST /", "GET /company", "GET /:id", "POST /:id/reply", "PATCH /:id"] },
  { name: "Notifications", path: "notification", endpoints: ["GET /", "GET /unread-count", "PATCH /:id/read", "PATCH /read-all"] },
  { name: "Users", path: "users", endpoints: ["GET /me", "GET /"] },
];

modules.forEach(mod => {
  const folder = { name: mod.name, item: [] };
  
  if (mod.endpoints) {
    mod.endpoints.forEach(ep => {
      const [method, epPath] = ep.split(" ");
      folder.item.push({
        name: `${method} ${mod.name} ${epPath}`,
        request: {
          method,
          header: [
            { key: "Authorization", value: "{{superAdminToken}}", type: "text" },
            ...((method === 'POST' || method === 'PATCH') ? [{ key: "Content-Type", value: "application/json" }] : [])
          ],
          body: (method === 'POST' || method === 'PATCH') ? { mode: "raw", raw: "{\n}", options: { raw: { language: "json" } } } : undefined,
          url: { raw: `{{baseUrlLocal}}/${mod.path}${epPath === '/' ? '' : epPath}`, host: ["{{baseUrlLocal}}"], path: [mod.path, ...epPath.split('/').filter(Boolean)] }
        }
      });
    });
  } else {
    // Standard CRUD
    ["GET", "POST"].forEach(method => {
      folder.item.push({
        name: `${method === 'GET' ? 'Get All' : 'Create'} ${mod.name}`,
        request: {
          method,
          header: [
            { key: "Authorization", value: "{{superAdminToken}}", type: "text" },
            ...(method === 'POST' ? [{ key: "Content-Type", value: "application/json" }] : [])
          ],
          body: method === 'POST' ? { mode: "raw", raw: "{\n}", options: { raw: { language: "json" } } } : undefined,
          url: { raw: `{{baseUrlLocal}}/${mod.path}`, host: ["{{baseUrlLocal}}"], path: [mod.path] }
        }
      });
    });
    ["GET", "PATCH", "DELETE"].forEach(method => {
      folder.item.push({
        name: `${method === 'GET' ? 'Get Single' : method === 'PATCH' ? 'Update' : 'Delete'} ${mod.name}`,
        request: {
          method,
          header: [
            { key: "Authorization", value: "{{superAdminToken}}", type: "text" },
            ...(method === 'PATCH' ? [{ key: "Content-Type", value: "application/json" }] : [])
          ],
          body: method === 'PATCH' ? { mode: "raw", raw: "{\n}", options: { raw: { language: "json" } } } : undefined,
          url: { raw: `{{baseUrlLocal}}/${mod.path}/:id`, host: ["{{baseUrlLocal}}"], path: [mod.path, ":id"] }
        }
      });
    });
  }
  
  collection.item.push(folder);
});

const outPath = path.join('C:\\Users\\ahmed\\OneDrive\\Documents', 'ShiftPoint.postman_collection.json');
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2));
console.log(`Generated Postman collection at ${outPath}`);
