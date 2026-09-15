import { Link } from "react-router-dom";
import avatarFallback from "../../assets/avatar-alt.jpg";
import type { EmployeeListItem } from "../../types";
import styles from "./EmployeeCard.module.css";

interface Props {
  employee: EmployeeListItem;
  showEmployeePhoto: boolean;
}

export function EmployeeCard({ employee, showEmployeePhoto }: Props) {
  return (
    <Link to={`/employee/${employee.id}`} className={`card ${styles.card}`}>
      <img
        src={showEmployeePhoto ? employee.photoUrl || avatarFallback : avatarFallback}
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
