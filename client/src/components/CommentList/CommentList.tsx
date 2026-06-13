import type { Comment } from "../../types";
import styles from "./CommentList.module.css";

interface Props {
  comments: Comment[];
}

export function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return <p className="muted">Комментариев пока нет</p>;
  }

  return (
    <ul className={styles.list}>
      {comments.map((comment) => (
        <li key={comment.id} className={styles.item}>
          <p className={styles.text}>{comment.text}</p>
          <time className="muted" dateTime={comment.createdAt}>
            {new Date(comment.createdAt).toLocaleString("ru-RU")}
          </time>
        </li>
      ))}
    </ul>
  );
}
