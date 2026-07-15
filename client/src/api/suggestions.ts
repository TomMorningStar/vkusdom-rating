import { apiFetch } from "./client";

export function submitSuggestion(text: string) {
  return apiFetch<{ id: number }>("/api/suggestions", {
    method: "POST",
    body: JSON.stringify({ text }),
    auth: false,
  });
}
