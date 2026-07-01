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

export type EmployeeFormPayload = {
  fullName: string;
  position: string;
  description?: string;
  photo?: File | null;
};

function toEmployeeFormData(data: EmployeeFormPayload) {
  const formData = new FormData();

  formData.append("fullName", data.fullName);
  formData.append("position", data.position);
  formData.append("description", data.description ?? "");

  if (data.photo) {
    formData.append("photo", data.photo);
  }

  return formData;
}

export function createEmployee(data: EmployeeFormPayload) {
  return apiFetch<EmployeeListItem>("/api/admin/employees", {
    method: "POST",
    body: toEmployeeFormData(data),
  });
}

export function updateEmployee(id: number, data: EmployeeFormPayload) {
  return apiFetch<EmployeeListItem>(`/api/admin/employees/${id}`, {
    method: "PATCH",
    body: toEmployeeFormData(data),
  });
}

export function deleteEmployee(id: number) {
  return apiFetch<{ id: number }>(`/api/admin/employees/${id}`, {
    method: "DELETE",
  });
}
