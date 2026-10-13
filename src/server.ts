/* eslint-disable @typescript-eslint/no-explicit-any */
import app, { connectDB } from "./app";
import config from "./app/config";
import mongoose from "mongoose";
import { Server } from "http";
import { initSocketIO } from "./app/utils/socket";
import { seedAll } from "./app/DB";

let server: Server;

async function main() {
  try {
    await connectDB();

    server = app.listen(config.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on port ${config.PORT} [${config.NODE_ENV}]`);
    });

    initSocketIO(server);

    // Initial database seeds (self-contained and idempotent)
    await seedAll();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

// Graceful shutdown helper
async function gracefulShutdown(signal?: string) {
  try {
    // eslint-disable-next-line no-console
    console.log(
      `\n${signal ? signal + " received." : ""} Shutting down gracefully...`,
    );

    // Close server
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      // eslint-disable-next-line no-console
      console.log("HTTP server closed");
    }

    // Close DB connection
    await mongoose.disconnect();
    // eslint-disable-next-line no-console
    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error during shutdown", err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  main();
}

if (!process.env.VERCEL) {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: any) => {
    // eslint-disable-next-line no-console
    console.error("💥 Unhandled Rejection detected:", reason);
    gracefulShutdown("unhandledRejection");
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    // eslint-disable-next-line no-console
    console.error("💥 Uncaught Exception detected:", error);
    gracefulShutdown("uncaughtException");
  });

  // Handle termination signals
  process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
  });
}

export default app;
