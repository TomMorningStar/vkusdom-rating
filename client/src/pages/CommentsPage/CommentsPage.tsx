import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { approveComment, deleteComment, getPendingComments } from "../../api/employees";
import type { PendingComment } from "../../types";
import styles from "./CommentsPage.module.css";

export function CommentsPage() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    getPendingComments()
      .then(setComments)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: number) {
    setError("");
    setBusyId(id);
    try {
      await approveComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка одобрения");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить комментарий?")) return;

    setError("");
    setBusyId(id);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <h1 className="page-title">Комментарии на модерации</h1>
      {error && <div className="error">{error}</div>}

      {comments.length === 0 ? (
        <p className="muted">Нет комментариев, ожидающих проверки</p>
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <div key={comment.id} className={`card ${styles.item}`}>
              <div className={styles.meta}>
                <Link to={`/employee/${comment.employeeId}`} className={styles.employeeLink}>
                  {comment.employeeName}
                </Link>
                <time className="muted" dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleString("ru-RU")}
                </time>
              </div>
              <p className={styles.text}>{comment.text}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busyId === comment.id}
                  onClick={() => handleApprove(comment.id)}
                >
                  Одобрить
                </button>
                <button
                  type="button"
                  className={`btn ${styles.deleteBtn}`}
                  disabled={busyId === comment.id}
                  onClick={() => handleDelete(comment.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
