import { Request, Response } from "express";
import { employeeRepository } from "../repositories/employeeRepository";
import { mapEmployeeDetail } from "../services/employeeService";
import { ratingService } from "../services/voteService";
import { voteService } from "../services/voteService";
import { parseEmployeeId, getClientIp, getUserAgent } from "../utils/request";
import { sendError, sendSuccess } from "../utils/response";
import { validateVoteBody } from "../validators/voteValidator";

export const healthController = {
  check(_req: Request, res: Response) {
    sendSuccess(res, { status: "ok" });
  },
};

export const employeeController = {
  async getById(req: Request, res: Response) {
    const id = parseEmployeeId(req.params.id);
    if (!id) {
      return sendError(res, "Некорректный id сотрудника", 400);
    }

    const employee = await employeeRepository.findById(id);
    if (!employee || !employee.isActive) {
      return sendError(res, "Сотрудник не найден", 404);
    }

    sendSuccess(res, mapEmployeeDetail(employee));
  },

  async getComments(req: Request, res: Response) {
    const id = parseEmployeeId(req.params.id);
    if (!id) {
      return sendError(res, "Некорректный id сотрудника", 400);
    }

    const employee = await employeeRepository.findById(id);
    if (!employee || !employee.isActive) {
      return sendError(res, "Сотрудник не найден", 404);
    }

    const comments = await employeeRepository.findComments(id);
    sendSuccess(res, comments);
  },

  async vote(req: Request, res: Response) {
    const id = parseEmployeeId(req.params.id);
    if (!id) {
      return sendError(res, "Некорректный id сотрудника", 400);
    }

    const validation = validateVoteBody(req.body);
    if (!validation.ok) {
      return sendError(res, validation.message, 400);
    }

    const result = await voteService.castVote({
      employeeId: id,
      type: validation.data.type,
      comment: validation.data.comment,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    if ("error" in result && result.error) {
      return sendError(res, result.error, result.status);
    }

    sendSuccess(res, result.data, 201);
  },
};

export const ratingController = {
  async list(_req: Request, res: Response) {
    const rating = await ratingService.getRating();
    sendSuccess(res, rating);
  },
};
