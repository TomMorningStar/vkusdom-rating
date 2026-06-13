import type { ApiError, ApiSuccess } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!json.success) {
    throw new ApiRequestError(json.message);
  }

  return json.data;
}
