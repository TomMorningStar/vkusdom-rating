import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getEmployee,
  getEmployeeComments,
  voteForEmployee,
} from "../../api/employees";
import { CommentList } from "../../components/CommentList";
import { VoteForm } from "../../components/VoteForm";
import type { Comment, EmployeeDetail } from "../../types";
import styles from "./EmployeePage.module.css";

export function EmployeePage() {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);
  const isValidId = Number.isInteger(employeeId) && employeeId > 0;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadedForId, setLoadedForId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [voteMessage, setVoteMessage] = useState("");
  const [voted, setVoted] = useState(false);

  const loading = isValidId && loadedForId !== employeeId;

  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;

    Promise.all([getEmployee(employeeId), getEmployeeComments(employeeId)])
      .then(([emp, comms]) => {
        if (!cancelled) {
          setEmployee(emp);
          setComments(comms);
          setError("");
          setLoadedForId(employeeId);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
          setLoadedForId(employeeId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId, isValidId]);

  async function handleVote(type: "LIKE" | "DISLIKE", comment: string) {
    setVoteMessage("");
    setError("");
    try {
      const result = await voteForEmployee(employeeId, type, comment || undefined);
      setEmployee((prev) =>
        prev ? { ...prev, likes: result.likes, dislikes: result.dislikes } : prev,
      );
      setVoted(true);
      setVoteMessage("Голос учтён!");
      if (comment) {
        const comms = await getEmployeeComments(employeeId);
        setComments(comms);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка голосования");
    }
  }

  if (!isValidId) return <div className="error">Некорректный id сотрудника</div>;
  if (loading) return <p>Загрузка...</p>;
  if (error && !employee) return <div className="error">{error}</div>;
  if (!employee) return <div className="error">Сотрудник не найден</div>;

  return (
    <div className="container" style={{ paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
      <div className={`card ${styles.profile}`}>
        <img
          src={employee.photoUrl || "https://via.placeholder.com/200"}
          alt={employee.fullName}
          className={styles.photo}
        />
        <div>
          <h1 className={styles.name}>{employee.fullName}</h1>
          <p className={styles.position}>{employee.position}</p>
          <p>{employee.description}</p>
          <p className={styles.stats}>
            👍 {employee.likes} · 👎 {employee.dislikes}
          </p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {voteMessage && <div className="success">{voteMessage}</div>}

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Голосование</h2>
        <VoteForm onSubmit={handleVote} disabled={voted} />
        {voted && <p className="muted">Вы уже проголосовали за этого сотрудника</p>}
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Комментарии</h2>
        <CommentList comments={comments} />
      </section>
    </div>
  );
}
