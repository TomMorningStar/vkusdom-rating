import { useEffect, useState } from "react";
import { isAuthenticated } from "../../api/auth";
import { submitSuggestion } from "../../api/suggestions";
import { BrandLogo } from "../../components/BrandLogo";
import { Header } from "../../components/Header";
import styles from "./SuggestionPage.module.css";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ALLOWED_PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

function isAllowedPhoto(file: File) {
  if (ALLOWED_PHOTO_TYPES.includes(file.type)) return true;
  // iOS/Android browsers sometimes leave `type` empty for HEIC/HEIF files
  const name = file.name.toLowerCase();
  return !file.type && ALLOWED_PHOTO_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function SuggestionPage() {
  const showHeader = isAuthenticated();

  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAllowedPhoto(file)) {
      setError("Можно загрузить только JPG, PNG, WEBP или HEIC");
      setFileInputKey((k) => k + 1);
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setError("Фото должно быть не больше 10 МБ");
      setFileInputKey((k) => k + 1);
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setError("");
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function handleRemovePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhoto(null);
    setPhotoPreview(null);
    setFileInputKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    setError("");
    setSubmitting(true);
    try {
      await submitSuggestion(trimmed, photo);
      setText("");
      handleRemovePhoto();
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
        <h1 className="page-title">Что бы вы хотели видеть во ВкусДом?</h1>

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

          {photoPreview ? (
            <div className={styles.previewWrap}>
              <img src={photoPreview} alt="" className={styles.preview} />
              <div className={styles.previewActions}>
                <label className={`btn ${styles.fileButton}`}>
                  Заменить фото
                  <input
                    key={fileInputKey}
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={submitting}
                  />
                </label>
                <button
                  type="button"
                  className={`btn ${styles.removeBtn}`}
                  onClick={handleRemovePhoto}
                  disabled={submitting}
                >
                  Удалить фото
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.fileField}>
              <label className={`btn ${styles.fileButton}`}>
                Добавить фотографию
                <input
                  key={fileInputKey}
                  className={styles.fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                  onChange={handleFileChange}
                  disabled={submitting}
                />
              </label>
              <span className={styles.fileHint}>JPG, PNG, WEBP или HEIC до 10 МБ</span>
            </div>
          )}

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
