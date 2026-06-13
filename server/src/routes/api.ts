import { Router } from "express";
import {
  employeeController,
  healthController,
  ratingController,
} from "../controllers/employeeController";

export const apiRouter = Router();

apiRouter.get("/health", healthController.check);
apiRouter.get("/employees", employeeController.list);
apiRouter.get("/employees/:id", employeeController.getById);
apiRouter.get("/employees/:id/comments", employeeController.getComments);
apiRouter.post("/employees/:id/vote", employeeController.vote);
apiRouter.get("/rating", ratingController.list);
