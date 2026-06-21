import { Link } from "react-router-dom";
import type { EmployeeListItem } from "../../types";
import styles from "./EmployeeCard.module.css";

interface Props {
  employee: EmployeeListItem;
}

export function EmployeeCard({ employee }: Props) {
  return (
    <Link to={`/employee/${employee.id}`} className={`card ${styles.card}`}>
      <img
        src={employee.photoUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSycd0HdIYXtPJpAqD9oOYvAPoVQX8YfIsANw&s"}
        alt={employee.fullName}
        className={styles.photo}
      />
      <div>
        <h2 className={styles.name}>{employee.fullName}</h2>
        <p className="muted">{employee.position}</p>
        <p className={styles.stats}>
          👍 {employee.likes} · 👎 {employee.dislikes}
        </p>
      </div>
    </Link>
  );
}
