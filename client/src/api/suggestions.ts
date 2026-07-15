import { apiFetch } from "./client";
import type { AdminSuggestion } from "../types";

export function submitSuggestion(text: string, photo?: File | null) {
  const formData = new FormData();
  formData.append("text", text);

  if (photo) {
    formData.append("photo", photo);
  }

  return apiFetch<{ id: number }>("/api/suggestions", {
    method: "POST",
    body: formData,
    auth: false,
  });
}

export function getSuggestions() {
  return apiFetch<AdminSuggestion[]>("/api/admin/suggestions");
}

export function deleteSuggestion(id: number) {
  return apiFetch<{ id: number }>(`/api/admin/suggestions/${id}`, {
    method: "DELETE",
  });
}
