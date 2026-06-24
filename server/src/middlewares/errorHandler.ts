import { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  sendError(res, "Внутренняя ошибка сервера", 500);
}

export function notFoundHandler(_req: Request, res: Response) {
  sendError(res, "Маршрут не найден", 404);
}
