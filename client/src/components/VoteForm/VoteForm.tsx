import { useState } from "react";
import type { VoteType } from "../../types";
import styles from "./VoteForm.module.css";

interface Props {
  onSubmit: (type: VoteType, comment: string) => Promise<void>;
  disabled?: boolean;
}

export function VoteForm({ onSubmit, disabled }: Props) {
  const [type, setType] = useState<VoteType | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;

    setLoading(true);
    try {
      await onSubmit(type, comment.trim());
      setComment("");
      setType(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.buttons}>
        <button
          type="button"
          className={`btn btn-like ${type === "LIKE" ? "btn-selected" : ""}`}
          onClick={() => setType("LIKE")}
          disabled={disabled || loading}
        >
          Лайк
        </button>
        <button
          type="button"
          className={`btn btn-dislike ${type === "DISLIKE" ? "btn-selected" : ""}`}
          onClick={() => setType("DISLIKE")}
          disabled={disabled || loading}
        >
          Дизлайк
        </button>
      </div>

      <textarea
        className={styles.textarea}
        placeholder="Комментарий (необязательно)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={disabled || loading}
        rows={3}
        maxLength={1000}
      />

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!type || disabled || loading}
      >
        {loading ? "Отправка..." : "Отправить голос"}
      </button>
    </form>
  );
}
