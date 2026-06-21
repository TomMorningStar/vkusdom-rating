import dotenv from "dotenv";

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  adminLogin: getRequiredEnv("ADMIN_LOGIN"),
  adminPassword: getRequiredEnv("ADMIN_PASSWORD"),
};
