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

let cachedPromise: Promise<typeof mongoose> | null = null;

const ensureDBConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!config.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not defined in environment variables. Please check your Vercel Project Settings.",
    );
  }
  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(config.DATABASE_URL as string, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch((err) => {
        cachedPromise = null;
        throw new Error(
          `Failed to connect to MongoDB: ${err.message}. If deploying on Vercel, please make sure '0.0.0.0/0' is added to MongoDB Atlas Network Access.`,
        );
      });
  }
  await cachedPromise;
};

// Ensure database connection in serverless environment
app.use(async (req, res, next) => {
  if (
    req.path === "/" ||
    req.path === "/favicon.ico" ||
    req.path === "/health" ||
    req.path === "/api/health"
  ) {
    return next();
  }
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    next(err);
  }
});

const allowedOrigins = process.env.CLIENT_URLS?.split(",") || [];

app.use(
  cors({
    // origin: (origin, callback) => {
    //   if (
    //     !origin ||
    //     allowedOrigins.includes(origin) ||
    //     origin.endsWith(".vercel.app") ||
    //     origin.includes("localhost")
    //   ) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://plezytoys-frontend.vercel.app",
    ],
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
