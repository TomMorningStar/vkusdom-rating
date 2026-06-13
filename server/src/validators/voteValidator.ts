export type VoteTypeInput = "LIKE" | "DISLIKE";

export interface VoteBody {
  type: VoteTypeInput;
  comment?: string;
}

const MAX_COMMENT_LENGTH = 1000;

export function validateVoteBody(body: unknown): { ok: true; data: VoteBody } | { ok: false; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Тело запроса должно быть JSON-объектом" };
  }

  const { type, comment } = body as Record<string, unknown>;

  if (type !== "LIKE" && type !== "DISLIKE") {
    return { ok: false, message: 'Поле type должно быть "LIKE" или "DISLIKE"' };
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== "string") {
      return { ok: false, message: "Поле comment должно быть строкой" };
    }
    const trimmed = comment.trim();
    if (trimmed.length === 0) {
      return { ok: false, message: "Комментарий не может быть пустым" };
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      return { ok: false, message: `Комментарий не длиннее ${MAX_COMMENT_LENGTH} символов` };
    }
    return { ok: true, data: { type, comment: trimmed } };
  }

  return { ok: true, data: { type } };
}
