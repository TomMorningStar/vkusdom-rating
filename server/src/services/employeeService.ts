import { VoteType } from "@prisma/client";

export function countVotes(votes: { type: VoteType }[]) {
  const likes = votes.filter((v) => v.type === "LIKE").length;
  const dislikes = votes.filter((v) => v.type === "DISLIKE").length;
  return { likes, dislikes, score: likes - dislikes };
}

export function mapEmployeeListItem(employee: {
  id: number;
  fullName: string;
  position: string;
  description: string;
  photoUrl: string;
  votes: { type: VoteType }[];
  _count: { comments: number };
}) {
  const { likes, dislikes, score } = countVotes(employee.votes);
  return {
    id: employee.id,
    fullName: employee.fullName,
    position: employee.position,
    description: employee.description,
    photoUrl: employee.photoUrl,
    likes,
    dislikes,
    commentsCount: employee._count.comments,
    score,
  };
}

export function mapEmployeeDetail(employee: {
  id: number;
  fullName: string;
  position: string;
  description: string;
  photoUrl: string;
  isActive: boolean;
  votes: { type: VoteType }[];
}) {
  const { likes, dislikes } = countVotes(employee.votes);
  return {
    id: employee.id,
    fullName: employee.fullName,
    position: employee.position,
    description: employee.description,
    photoUrl: employee.photoUrl,
    isActive: employee.isActive,
    likes,
    dislikes,
  };
}
