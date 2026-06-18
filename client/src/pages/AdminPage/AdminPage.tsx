import { useEffect, useState } from "react";
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from "../../api/employees";
import type { AdminEmployee } from "../../types";
import styles from "./AdminPage.module.css";

const emptyForm = {
  fullName: "",
  position: "",
  description: "",
  photoUrl: "",
};

export function AdminPage() {
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loading = !loaded;

  useEffect(() => {
    let cancelled = false;

    getEmployees()
      .then((data) => {
        if (!cancelled) {
          setEmployees(data);
          setLoaded(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function reloadEmployees() {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      if (editingId) {
        await updateEmployee(editingId, form);
        setMessage("Сотрудник обновлён");
      } else {
        await createEmployee(form);
        setMessage("Сотрудник добавлен");
      }
      resetForm();
      reloadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(employee: AdminEmployee) {
    setEditingId(employee.id);
    setForm({
      fullName: employee.fullName,
      position: employee.position,
      description: employee.description,
      photoUrl: employee.photoUrl,
    });
    setMessage("");
    setError("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить сотрудника? Все голоса и комментарии тоже будут удалены.")) return;

    setError("");
    try {
      await deleteEmployee(id);
      setMessage("Сотрудник удалён");
      if (editingId === id) resetForm();
      reloadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  if (loading) return <p>Загрузка...</p>;

  return (
    <>
      <h1 className="page-title">Управление сотрудниками</h1>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <section className={`card ${styles.formSection}`}>
        <h2>{editingId ? "Редактировать" : "Добавить сотрудника"}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            placeholder="ФИО"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <input
            className={styles.input}
            placeholder="Должность"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            required
          />
          <textarea
            className={styles.textarea}
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <input
            className={styles.input}
            placeholder="URL фото"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          />
          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Сохранение..." : editingId ? "Сохранить" : "Добавить"}
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Все сотрудники</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Должность</th>
              <th>QR</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.fullName}</td>
                <td>{employee.position}</td>
                <td>
                  <code className={styles.qrLink}>/employee/{employee.id}</code>
                </td>
                <td className={styles.actions}>
                  <button type="button" className="btn" onClick={() => startEdit(employee)}>
                    Изменить
                  </button>
                  <button
                    type="button"
                    className={`btn ${styles.deleteBtn}`}
                    onClick={() => handleDelete(employee.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
