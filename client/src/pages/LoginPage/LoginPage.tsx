import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../../api/admin";
import { isAuthenticated, setCredentials } from "../../api/auth";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginValue, password);
      setCredentials(loginValue, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={`card ${styles.form}`} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Вход для администратора</h1>

        {error && <div className="error">{error}</div>}

        <label className={styles.label}>
          Логин
          <input
            className={styles.input}
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className={styles.label}>
          Пароль
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
