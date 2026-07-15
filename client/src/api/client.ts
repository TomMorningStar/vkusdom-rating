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
  const isFormData = rest.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

  let json: ApiSuccess<T> | ApiError;
  try {
    json = (await response.json()) as ApiSuccess<T> | ApiError;
  } catch {
    // Non-JSON body: nginx error pages (e.g. 413 when the upload exceeds
    // client_max_body_size) never reach the API's JSON envelope
    if (response.status === 413) {
      throw new ApiRequestError("Файл слишком большой. Фото должно быть не больше 10 МБ");
    }
    throw new ApiRequestError(`Ошибка сервера (${response.status}). Попробуйте ещё раз`);
  }

  if (json.success === false) {
    throw new ApiRequestError(json.message);
  }

  return json.data;
}
