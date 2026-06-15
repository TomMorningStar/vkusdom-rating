import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const app = createApp();

async function start() {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`Server started on http://localhost:${env.port}`);
  });
}

async function shutdown() {
  await prisma.$disconnect();
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
