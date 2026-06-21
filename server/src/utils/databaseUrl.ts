import type { PoolConfig } from "pg";

export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  return raw;
}

function getPoolMax(): number {
  const value = Number(process.env.DB_POOL_MAX);
  return Number.isInteger(value) && value > 0 ? value : 10;
}

function shouldUseSsl(): boolean {
  return process.env.DATABASE_SSL === "true";
}

export function getPgPoolConfig(): PoolConfig {
  const connectionString = getDatabaseUrl();

  return {
    connectionString,
    keepAlive: true,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    max: getPoolMax(),
    ...(shouldUseSsl() && {
      ssl: { rejectUnauthorized: false },
    }),
  };
}
