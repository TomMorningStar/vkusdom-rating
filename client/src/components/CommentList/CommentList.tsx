import type { Comment } from "../../types";
import styles from "./CommentList.module.css";

interface Props {
  comments: Comment[];
  onDelete?: (id: number) => void;
}

export function CommentList({ comments, onDelete }: Props) {
  if (comments.length === 0) {
    return <p className="muted">Комментариев пока нет</p>;
  }

  return (
    <ul className={styles.list}>
      {comments.map((comment) => (
        <li key={comment.id} className={styles.item}>
          <p className={styles.text}>{comment.text}</p>
          <div className={styles.footer}>
            <time className="muted" dateTime={comment.createdAt}>
              {new Date(comment.createdAt).toLocaleString("ru-RU")}
            </time>
            {onDelete && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => onDelete(comment.id)}
              >
                Удалить
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
