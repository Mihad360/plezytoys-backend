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
// Request logging
app.use(logHttpRequests);

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!config.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.warn("DATABASE_URL is not defined in environment variables");
    return;
  }
  try {
    await mongoose.connect(config.DATABASE_URL as string, {
      dbName: "Plezytoys",
      serverSelectionTimeoutMS: 5000,
    });
    // eslint-disable-next-line no-console
    console.log("Database connected successfully");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Database connection error:", err);
  }
};

// Initiate connection
connectDB();

// Ensure connection before handling API routes
app.use(async (req, res, next) => {
  if (
    req.path === "/" ||
    req.path === "/favicon.ico" ||
    req.path === "/health" ||
    req.path === "/api/health"
  ) {
    return next();
  }
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

const allowedOrigins =
  process.env.CLIENT_URLS?.split(",").map((s) => s.trim()) || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman)
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
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// Static file hosting
app.use("/public", express.static(path.join(process.cwd(), "public")));

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
