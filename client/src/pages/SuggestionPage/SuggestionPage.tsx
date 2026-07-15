import { useState } from "react";
import { isAuthenticated } from "../../api/auth";
import { submitSuggestion } from "../../api/suggestions";
import { BrandLogo } from "../../components/BrandLogo";
import { Header } from "../../components/Header";
import styles from "./SuggestionPage.module.css";

export function SuggestionPage() {
  const showHeader = isAuthenticated();

  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    setError("");
    setSubmitting(true);
    try {
      await submitSuggestion(trimmed);
      setText("");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {showHeader && <Header />}
      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <BrandLogo />
        </div>
        <h1 className="page-title">Что бы вы хотели видеть во ВкусДом</h1>

        {error && <div className="error">{error}</div>}
        {sent && <div className="success">Спасибо! Ваше предложение отправлено.</div>}

        <form className={`card ${styles.form}`} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            placeholder="Ваше предложение по ассортименту..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSent(false);
            }}
            rows={5}
            maxLength={1000}
            disabled={submitting}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !text.trim()}
          >
            {submitting ? "Отправка..." : "Отправить предложение"}
          </button>
        </form>
      </div>
    </>
  );
}
