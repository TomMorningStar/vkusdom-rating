import { apiFetch } from "./client";

export function login(login: string, password: string) {
  return apiFetch<{ ok: true }>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
    auth: false,
  });
}
