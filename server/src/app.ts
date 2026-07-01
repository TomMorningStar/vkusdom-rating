import cors from "cors";
import express from "express";
import { uploadsRoot } from "./config/uploads";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { apiRouter } from "./routes/api";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/uploads", express.static(uploadsRoot));
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
