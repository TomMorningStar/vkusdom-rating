import { prisma } from "../config/prisma";

export const suggestionRepository = {
  create(data: { text: string; photoUrl: string; ipAddress: string; userAgent: string }) {
    return prisma.suggestion.create({ data });
  },

  findAll() {
    return prisma.suggestion.findMany({ orderBy: { createdAt: "desc" } });
  },

  findById(id: number) {
    return prisma.suggestion.findUnique({ where: { id } });
  },

  delete(id: number) {
    return prisma.suggestion.delete({ where: { id } });
  },
};
