export interface SuggestionBody {
  text: string;
}

const MAX_SUGGESTION_LENGTH = 1000;

export function validateSuggestionBody(
  body: unknown,
): { ok: true; data: SuggestionBody } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Тело запроса должно быть JSON-объектом" };
  }

  const { text } = body as Record<string, unknown>;

  if (typeof text !== "string") {
    return { ok: false, message: "Поле text должно быть строкой" };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { ok: false, message: "Предложение не может быть пустым" };
  }

  if (trimmed.length > MAX_SUGGESTION_LENGTH) {
    return { ok: false, message: `Предложение не длиннее ${MAX_SUGGESTION_LENGTH} символов` };
  }

  return { ok: true, data: { text: trimmed } };
}
