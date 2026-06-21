import { useState } from 'react';
import type { VoteType } from '../../types';
import styles from './VoteForm.module.css';

interface Props {
	onSubmit: (type: VoteType, comment: string) => Promise<void>;
	disabled?: boolean;
}

export function VoteForm({ onSubmit, disabled }: Props) {
	const [type, setType] = useState<VoteType | null>(null);
	const [comment, setComment] = useState('');
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!type) return;

		setLoading(true);
		try {
			await onSubmit(type, comment.trim());
			setComment('');
			setType(null);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<div className={styles.voteButtons}>
				<button
					type='button'
					className={`${styles.voteBtn} ${styles.voteBtnLike}${type === 'LIKE' ? ` ${styles.selected}` : ''}`}
					onClick={() => setType('LIKE')}
					disabled={disabled || loading}
				>
					👍 Лайк
				</button>
				<button
					type='button'
					className={`${styles.voteBtn} ${styles.voteBtnDislike}${type === 'DISLIKE' ? ` ${styles.selected}` : ''}`}
					onClick={() => setType('DISLIKE')}
					disabled={disabled || loading}
				>
					👎 Дизлайк
				</button>
			</div>

			<textarea
				className={styles.textarea}
				placeholder='Комментарий (необязательно)'
				value={comment}
				onChange={e => setComment(e.target.value)}
				disabled={disabled || loading}
				rows={3}
				maxLength={1000}
			/>

			<button
				type='submit'
				className={styles.submitBtn}
				disabled={!type || disabled || loading}
			>
				{loading ? 'Отправка...' : 'Отправить голос'}
			</button>
		</form>
	);
}
