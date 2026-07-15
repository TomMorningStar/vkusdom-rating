import { prisma } from "../config/prisma";

export const suggestionRepository = {
  create(data: { text: string; ipAddress: string; userAgent: string }) {
    return prisma.suggestion.create({ data });
  },
};
