import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "../../api/auth";
import { getPublicEmployees } from "../../api/employees";
import { BrandLogo } from "../../components/BrandLogo";
import { EmployeeCard } from "../../components/EmployeeCard";
import { Header } from "../../components/Header";
import type { EmployeeListItem } from "../../types";
import styles from "./HomePage.module.css";

export function HomePage() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showHeader = isAuthenticated();

  useEffect(() => {
    getPublicEmployees()
      .then(setEmployees)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {showHeader && <Header />}
      <div className={`container ${styles.page}`}>
        {loading && <p>Загрузка...</p>}
        {!loading && error && <div className="error">{error}</div>}
        {!loading && !error && (
          <>
            <div className={styles.header}>
              <BrandLogo />
            </div>
            <p className="muted">
              Выберите сотрудника из списка чтобы оставить свой отзыв или{" "}
              <Link to="/suggestions">оставить предложение</Link>
            </p>
            <div className="grid">
              {employees.map((employee) => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
