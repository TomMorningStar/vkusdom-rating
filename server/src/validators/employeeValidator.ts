export interface EmployeeInput {
  fullName: string;
  position: string;
  description?: string;
  photoUrl?: string;
}

export function validateEmployeeBody(
  body: unknown,
): { ok: true; data: EmployeeInput } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Тело запроса должно быть JSON-объектом" };
  }

  const { fullName, position, description, photoUrl } = body as Record<string, unknown>;

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    return { ok: false, message: "ФИО обязательно (минимум 2 символа)" };
  }

  if (typeof position !== "string" || position.trim().length < 2) {
    return { ok: false, message: "Должность обязательна (минимум 2 символа)" };
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    return { ok: false, message: "Описание должно быть строкой" };
  }

  if (photoUrl !== undefined && photoUrl !== null && typeof photoUrl !== "string") {
    return { ok: false, message: "photoUrl должен быть строкой" };
  }

  return {
    ok: true,
    data: {
      fullName: fullName.trim(),
      position: position.trim(),
      description: typeof description === "string" ? description.trim() : "",
      photoUrl: typeof photoUrl === "string" ? photoUrl.trim() : "",
    },
  };
}

export function validateLoginBody(
  body: unknown,
): { ok: true; data: { login: string; password: string } } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Тело запроса должно быть JSON-объектом" };
  }

  const { login, password } = body as Record<string, unknown>;

  if (typeof login !== "string" || login.trim().length === 0) {
    return { ok: false, message: "Логин обязателен" };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { ok: false, message: "Пароль обязателен" };
  }

  return { ok: true, data: { login: login.trim(), password } };
}
