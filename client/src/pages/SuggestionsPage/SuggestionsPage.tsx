import { useEffect, useState } from "react";
import { deleteSuggestion, getSuggestions } from "../../api/suggestions";
import type { AdminSuggestion } from "../../types";
import styles from "./SuggestionsPage.module.css";

export function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<AdminSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    getSuggestions()
      .then(setSuggestions)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Удалить предложение?")) return;

    setError("");
    setBusyId(id);
    try {
      await deleteSuggestion(id);
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <h1 className="page-title">Предложения</h1>
      {error && <div className="error">{error}</div>}

      {suggestions.length === 0 ? (
        <p className="muted">Предложений пока нет</p>
      ) : (
        <div className={styles.list}>
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className={`card ${styles.item}`}>
              <div className={styles.meta}>
                <time className="muted" dateTime={suggestion.createdAt}>
                  {new Date(suggestion.createdAt).toLocaleString("ru-RU")}
                </time>
                <span className={styles.ip}>{suggestion.ipAddress}</span>
              </div>
              <p className={styles.text}>{suggestion.text}</p>
              {suggestion.photoUrl && (
                <a
                  href={suggestion.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.photoLink}
                >
                  <img src={suggestion.photoUrl} alt="" className={styles.photo} />
                </a>
              )}
              <p className={styles.userAgent}>{suggestion.userAgent}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={`btn ${styles.deleteBtn}`}
                  disabled={busyId === suggestion.id}
                  onClick={() => handleDelete(suggestion.id)}
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
