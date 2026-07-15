import { Request, Response } from "express";
import { deleteSuggestionUploadedFile, getSuggestionPhotoUrl } from "../middlewares/uploadSuggestionPhoto";
import { suggestionRepository } from "../repositories/suggestionRepository";
import { getClientIp, getUserAgent } from "../utils/request";
import { sendError, sendSuccess } from "../utils/response";
import { validateSuggestionBody } from "../validators/suggestionValidator";

export const suggestionController = {
  async create(req: Request, res: Response) {
    const validation = validateSuggestionBody(req.body);
    if (!validation.ok) {
      await deleteSuggestionUploadedFile(req.file);
      return sendError(res, validation.message, 400);
    }

    let suggestion;

    try {
      suggestion = await suggestionRepository.create({
        text: validation.data.text,
        photoUrl: getSuggestionPhotoUrl(req.file) ?? "",
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    } catch (err) {
      await deleteSuggestionUploadedFile(req.file);
      throw err;
    }

    sendSuccess(res, { id: suggestion.id }, 201);
  },
};
