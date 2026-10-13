import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import mongoose from "mongoose";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";
import { template } from "./rootTemplate";
import { privacyControllers } from "./app/modules/Settings/privacy/Privacy.controller";
import { logHttpRequests } from "./logger/logger";

const app: Application = express();
const allowedOrigins =
  process.env.CLIENT_URLS?.split(",").map((s) => s.trim()) || [];

// 1. CORS FIRST so every response has CORS headers attached
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

// 2. Parsers & logging
app.use(logHttpRequests);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// 3. Database connection helper
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!config.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.warn("DATABASE_URL is not defined in environment variables");
    return;
  }
  await mongoose.connect(config.DATABASE_URL as string, {
    dbName: "Plezytoys",
    serverSelectionTimeoutMS: 5000,
  });
  // eslint-disable-next-line no-console
  console.log("Database connected successfully");
};

// 4. Static file hosting
app.use("/public", express.static(path.join(process.cwd(), "public")));

// 5. Connect database before handling API routes
app.use("/api/v1", async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message:
          "Database connection failed. Please ensure '0.0.0.0/0' is whitelisted in MongoDB Atlas Network Access.",
        error: err?.message || String(err),
      });
    }
  }
  next();
});

// Application API routes
app.use("/api/v1", router);

// Publicly accessible legal / policy routes
app.use("/privacy-policy", privacyControllers.htmlRoute);
app.use("/app-instruction", privacyControllers.appInstruction);

// Welcome Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send(template);
});

// Environment & Database Health Check Route
app.get(["/health", "/api/health"], (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    nodeEnv: config.NODE_ENV,
    hasDatabaseUrl: Boolean(config.DATABASE_URL),
    isDbConnected: mongoose.connection.readyState === 1,
  });
});

// 404 Not Found & Global Error Handler (in correct Express order)
app.use(notFound);
app.use(globalErrorHandler);

export default app;
