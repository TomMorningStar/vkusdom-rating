import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRating } from "../../api/employees";
import avatarFallback from "../../assets/avatar-alt.jpg";
import type { RatingItem } from "../../types";
import styles from "./RatingPage.module.css";

export function RatingPage() {
  const [rating, setRating] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRating()
      .then(setRating)
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <div className="error">{error}</div>;

  return (
    <>
      <h1 className="page-title">Рейтинг сотрудников</h1>
      <p className="muted">Счёт = лайки − дизлайки. Побеждает сотрудник с максимальным счётом.</p>

      <div className="card">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Сотрудник</th>
                <th>👍</th>
                <th>👎</th>
                <th>💬</th>
                <th>Счёт</th>
              </tr>
            </thead>
            <tbody>
              {rating.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link to={`/employee/${item.id}`} className={styles.employeeLink}>
                      <img
                        src={item.photoUrl || avatarFallback}
                        alt=""
                        className={styles.avatar}
                      />
                      <span>
                        <strong>{item.fullName}</strong>
                        <br />
                        <span className="muted">{item.position}</span>
                      </span>
                    </Link>
                  </td>
                  <td>{item.likes}</td>
                  <td>{item.dislikes}</td>
                  <td>{item.commentsCount}</td>
                  <td className={styles.score}>{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
