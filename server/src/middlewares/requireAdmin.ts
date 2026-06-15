import { Request, Response, NextFunction } from "express";
import { isValidAdminCredentials, parseBasicAuth } from "../utils/adminAuth";
import { sendError } from "../utils/response";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const credentials = parseBasicAuth(req.headers.authorization);

  if (!credentials || !isValidAdminCredentials(credentials.login, credentials.password)) {
    return sendError(res, "Неверный логин или пароль", 401);
  }

  next();
}
