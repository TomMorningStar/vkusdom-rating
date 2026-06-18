import { apiFetch } from "./client";
import type {
  AdminEmployee,
  Comment,
  EmployeeDetail,
  EmployeeListItem,
  RatingItem,
  VoteType,
} from "../types";

export function getEmployees() {
  return apiFetch<AdminEmployee[]>("/api/admin/employees");
}

export function getEmployee(id: number) {
  return apiFetch<EmployeeDetail>(`/api/employees/${id}`, { auth: false });
}

export function getEmployeeComments(id: number) {
  return apiFetch<Comment[]>(`/api/employees/${id}/comments`, { auth: false });
}

export function voteForEmployee(id: number, type: VoteType, comment?: string) {
  return apiFetch<{ likes: number; dislikes: number }>(`/api/employees/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ type, comment: comment || undefined }),
    auth: false,
  });
}

export function getRating() {
  return apiFetch<RatingItem[]>("/api/admin/rating");
}

export function createEmployee(data: {
  fullName: string;
  position: string;
  description?: string;
  photoUrl?: string;
}) {
  return apiFetch<EmployeeListItem>("/api/admin/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateEmployee(
  id: number,
  data: {
    fullName: string;
    position: string;
    description?: string;
    photoUrl?: string;
  },
) {
  return apiFetch<EmployeeListItem>(`/api/admin/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(id: number) {
  return apiFetch<{ id: number }>(`/api/admin/employees/${id}`, {
    method: "DELETE",
  });
}
