import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

export const ENV = {
  APP_NAME: process.env.APP_NAME || "JMCA API",
  PORT: Number(process.env.PORT) || 7000,
  NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:7000",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev_only_secret",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
};