import type { PoolConfig } from "pg";

export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;

  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  return raw;
}

function isRemoteDatabase(url: string): boolean {
  return url.includes("render.com");
}

export function getPgPoolConfig(): PoolConfig {
  const connectionString = getDatabaseUrl();

  return {
    connectionString,
    keepAlive: true,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    max: 5,
    // Render закрывает долгоживущие соединения — ротируем до обрыва
    maxUses: 4,
    ...(isRemoteDatabase(connectionString) && {
      ssl: { rejectUnauthorized: false },
    }),
  };
}
