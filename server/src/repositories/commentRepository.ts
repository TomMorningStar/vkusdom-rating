import { prisma } from "../config/prisma";

export const commentRepository = {
  findById(id: number) {
    return prisma.comment.findUnique({ where: { id } });
  },

  findPending() {
    return prisma.comment.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      include: { employee: { select: { fullName: true } } },
    });
  },

  approve(id: number) {
    return prisma.comment.update({ where: { id }, data: { isApproved: true } });
  },

  delete(id: number) {
    return prisma.comment.delete({ where: { id } });
  },
};
