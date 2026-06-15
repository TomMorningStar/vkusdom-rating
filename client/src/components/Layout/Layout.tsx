import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearCredentials } from "../../api/auth";
import styles from "./Layout.module.css";

export function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearCredentials();
    navigate("/login");
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          ВкусДом — Голосование
        </Link>
        <nav className={styles.nav}>
          <Link to="/">Сотрудники</Link>
          <Link to="/rating">Рейтинг</Link>
          <Link to="/admin">Админка</Link>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Выйти
          </button>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
