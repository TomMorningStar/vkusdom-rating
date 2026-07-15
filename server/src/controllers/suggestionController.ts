import { Request, Response } from "express";
import { suggestionRepository } from "../repositories/suggestionRepository";
import { getClientIp, getUserAgent } from "../utils/request";
import { sendError, sendSuccess } from "../utils/response";
import { validateSuggestionBody } from "../validators/suggestionValidator";

export const suggestionController = {
  async create(req: Request, res: Response) {
    const validation = validateSuggestionBody(req.body);
    if (!validation.ok) {
      return sendError(res, validation.message, 400);
    }

    const suggestion = await suggestionRepository.create({
      text: validation.data.text,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    sendSuccess(res, { id: suggestion.id }, 201);
  },
};
