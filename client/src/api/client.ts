import type { ApiError, ApiSuccess } from "../types";
import { getAuthHeader } from "./auth";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type FetchOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const authHeader = getAuthHeader();
    if (authHeader) {
      headers.Authorization = authHeader;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers,
    ...rest,
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiError;

  if (json.success === false) {
    throw new ApiRequestError(json.message);
  }

  return json.data;
}
