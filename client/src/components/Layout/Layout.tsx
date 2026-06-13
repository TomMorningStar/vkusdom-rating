import { Link, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

export function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          ВкусДом — Голосование
        </Link>
        <nav className={styles.nav}>
          <Link to="/">Сотрудники</Link>
          <Link to="/rating">Рейтинг</Link>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
