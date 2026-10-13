import dotenv from "dotenv";
import path from "path";

// Load standard .env file
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const isProduction = process.env.NODE_ENV === "production";

const config = {
  NODE_ENV: (process.env.NODE_ENV as string) || "development",
  PORT: Number(process.env.PORT) || 5000,

  // Database URL (defaults to DATABASE_URL, with optional PROD_DATABASE_URL if in production)
  DATABASE_URL:
    isProduction && process.env.PROD_DATABASE_URL
      ? process.env.PROD_DATABASE_URL
      : process.env.DATABASE_URL,

  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

  NODE_MAIL_EMAIL: process.env.NODE_MAIL_EMAIL,
  NODE_MAIL_EMAIL_CLIENT: process.env.NODE_MAIL_EMAIL_CLIENT,
  NODE_MAIL_PASS: process.env.NODE_MAIL_PASS,

  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER,
  APP_NAME: process.env.APP_NAME,
  ENDPOINT_SECRET: process.env.ENDPOINT_SECRET,

  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_NAME: process.env.CLOUDINARY_FOLDER_NAME,

  LOCAL_URL: process.env.LOCAL_URL,
  CLIENT_URLS: process.env.CLIENT_URLS,

  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASS: process.env.ADMIN_PASS,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS,

  // STRIPE
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // FIREBASE
  FIREBASE_TYPE: process.env.FIREBASE_TYPE,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI: process.env.FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI: process.env.FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_CERT_URL: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  FIREBASE_CLIENT_CERT_URL: process.env.FIREBASE_CLIENT_CERT_URL,
  FIREBASE_UNIVERSE_DOMAIN: process.env.FIREBASE_UNIVERSE_DOMAIN,

  // MAPS & LOCATION
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,

  // AI ASSISTANT
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
} as const;

export default config;
