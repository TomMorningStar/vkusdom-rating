import { useEffect, useState } from "react";
import { getEmployees } from "../../api/employees";
import { EmployeeCard } from "../../components/EmployeeCard";
import type { EmployeeListItem } from "../../types";

export function HomePage() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="page-title">Сотрудники</h1>
      <p className="muted" style={{ marginBottom: "1.5rem" }}>
        Отсканируйте QR-код на бейджике или выберите сотрудника из списка
      </p>
      <div className="grid">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </>
  );
}
