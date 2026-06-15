import { Router } from "express";
import { adminController, authController } from "../controllers/adminController";
import {
  employeeController,
  healthController,
  ratingController,
} from "../controllers/employeeController";
import { requireAdmin } from "../middlewares/requireAdmin";

export const apiRouter = Router();

apiRouter.get("/health", healthController.check);
apiRouter.post("/admin/login", authController.login);

apiRouter.get("/employees/:id", employeeController.getById);
apiRouter.get("/employees/:id/comments", employeeController.getComments);
apiRouter.post("/employees/:id/vote", employeeController.vote);

const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.get("/employees", adminController.list);
adminRouter.post("/employees", adminController.create);
adminRouter.patch("/employees/:id", adminController.update);
adminRouter.delete("/employees/:id", adminController.remove);
adminRouter.get("/rating", ratingController.list);

apiRouter.use("/admin", adminRouter);
