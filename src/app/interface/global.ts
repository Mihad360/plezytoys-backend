/* eslint-disable @typescript-eslint/no-namespace */
import { Types } from "mongoose";
import { Server as SocketIo } from "socket.io";

export interface JwtPayload {
  user: Types.ObjectId | string;
  email: string;
  role: "super_admin" | "company_admin" | "manager" | "employee" | "admin" | "user";
  company?: Types.ObjectId | string;
  iat?: number;
  exp?: number;
}

export const USER_ROLE = {
  super_admin: "super_admin",
  company_admin: "company_admin",
  manager: "manager",
  employee: "employee",
  admin: "admin",
  user: "user",
} as const;

export type TUserRole = keyof typeof USER_ROLE;

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
  namespace NodeJS {
    interface Global {
      io: SocketIo;
    }
  }
}
