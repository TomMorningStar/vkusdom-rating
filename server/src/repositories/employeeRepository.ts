import { prisma } from "../config/prisma";

export const employeeRepository = {
  findAllActive() {
    return prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      include: {
        _count: { select: { votes: true, comments: true } },
        votes: { select: { type: true } },
      },
    });
  },

  findById(id: number) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        votes: { select: { type: true } },
        comments: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  findComments(employeeId: number) {
    return prisma.comment.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  },

  findAll() {
    return prisma.employee.findMany({
      orderBy: { fullName: "asc" },
      include: {
        votes: { select: { type: true } },
      },
    });
  },

  create(data: {
    fullName: string;
    position: string;
    description: string;
    photoUrl: string;
  }) {
    return prisma.employee.create({ data });
  },

  update(
    id: number,
    data: {
      fullName?: string;
      position?: string;
      description?: string;
      photoUrl?: string;
      isActive?: boolean;
    },
  ) {
    return prisma.employee.update({ where: { id }, data });
  },
};
