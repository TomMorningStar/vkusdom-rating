import { apiFetch } from "./client";
import type {
  Comment,
  EmployeeDetail,
  EmployeeListItem,
  RatingItem,
  VoteType,
} from "../types";

export function getEmployees() {
  return apiFetch<EmployeeListItem[]>("/api/employees");
}

export function getEmployee(id: number) {
  return apiFetch<EmployeeDetail>(`/api/employees/${id}`);
}

export function getEmployeeComments(id: number) {
  return apiFetch<Comment[]>(`/api/employees/${id}/comments`);
}

export function voteForEmployee(id: number, type: VoteType, comment?: string) {
  return apiFetch<{ likes: number; dislikes: number }>(`/api/employees/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ type, comment: comment || undefined }),
  });
}

export function getRating() {
  return apiFetch<RatingItem[]>("/api/rating");
}
