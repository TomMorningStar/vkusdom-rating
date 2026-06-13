import { VoteType } from "@prisma/client";
import { prisma } from "../config/prisma";

export const voteRepository = {
  createVoteWithOptionalComment(params: {
    employeeId: number;
    type: VoteType;
    ipAddress: string;
    userAgent: string;
    comment?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const vote = await tx.vote.create({
        data: {
          employeeId: params.employeeId,
          type: params.type,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });

      let comment = null;
      if (params.comment) {
        comment = await tx.comment.create({
          data: {
            employeeId: params.employeeId,
            text: params.comment,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          },
        });
      }

      return { vote, comment };
    });
  },
};
