import { Prisma } from "@prisma/client";
import { employeeRepository } from "../repositories/employeeRepository";
import { voteRepository } from "../repositories/voteRepository";
import { countVotes, mapEmployeeListItem } from "./employeeService";

export const ratingService = {
  async getRating() {
    const employees = await employeeRepository.findAllActive();
    return employees
      .map(mapEmployeeListItem)
      .sort((a, b) => b.score - a.score || b.likes - a.likes);
  },
};

export const voteService = {
  async castVote(params: {
    employeeId: number;
    type: "LIKE" | "DISLIKE";
    comment?: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const employee = await employeeRepository.findById(params.employeeId);
    if (!employee) {
      return { error: "Сотрудник не найден", status: 404 as const };
    }

    try {
      const result = await voteRepository.createVoteWithOptionalComment({
        employeeId: params.employeeId,
        type: params.type,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        comment: params.comment,
      });

      const updated = await employeeRepository.findById(params.employeeId);
      const counts = countVotes(updated?.votes ?? []);

      return {
        data: {
          vote: result.vote,
          comment: result.comment,
          likes: counts.likes,
          dislikes: counts.dislikes,
        },
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return { error: "Вы уже голосовали за этого сотрудника", status: 409 as const };
      }
      throw err;
    }
  },
};
