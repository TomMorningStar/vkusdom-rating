import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isAuthenticated } from '../../api/auth';
import {
	getEmployee,
	getEmployeeComments,
	voteForEmployee,
} from '../../api/employees';
import { CommentList } from '../../components/CommentList';
import { VoteForm } from '../../components/VoteForm';
import type { Comment, EmployeeDetail } from '../../types';
import styles from './EmployeePage.module.css';
import { handleVote } from './helper/handleVote';

export function EmployeePage() {
	const { id } = useParams<{ id: string }>();
	const employeeId = Number(id);
	const isValidId = Number.isInteger(employeeId) && employeeId > 0;
	const showAdminBackLink = isAuthenticated();

	const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loadedForId, setLoadedForId] = useState<number | null>(null);
	const [error, setError] = useState('');
	const [voteMessage, setVoteMessage] = useState('');
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
					setError('');
					setLoadedForId(employeeId);
				}
			})
			.catch(err => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Ошибка загрузки');
					setLoadedForId(employeeId);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [employeeId, isValidId]);

	if (!isValidId)
		return <div className='error'>Некорректный id сотрудника</div>;
	if (loading) return <p>Загрузка...</p>;
	if (error && !employee) return <div className='error'>{error}</div>;
	if (!employee) return <div className='error'>Сотрудник не найден</div>;

	return (
		<div className={`container ${styles.page}`}>
			{showAdminBackLink && (
				<Link to='/' className={styles.backLink}>
					← На главный экран
				</Link>
			)}

			<div className={`card ${styles.profile}`}>
				<div className={styles.photoWrap}>
					<img
						src={employee.photoUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSycd0HdIYXtPJpAqD9oOYvAPoVQX8YfIsANw&s'}
						alt={employee.fullName}
						className={styles.photo}
					/>
				</div>
				<div className={styles.info}>
					<h1 className={styles.name}>{employee.fullName}</h1>
					<p className={styles.position}>{employee.position}</p>
					{employee.description && (
						<p className={styles.description}>{employee.description}</p>
					)}
					<div className={styles.stats}>
						<span className={`${styles.statBadge} ${styles.statLike}`}>
							👍 {employee.likes}
						</span>
						<span className={`${styles.statBadge} ${styles.statDislike}`}>
							👎 {employee.dislikes}
						</span>
					</div>
				</div>
			</div>

			{error && <div className='error'>{error}</div>}
			{voteMessage && <div className='success'>{voteMessage}</div>}

			<section className={`card ${styles.section}`}>
				<h2 className={styles.sectionTitle}>Голосование</h2>
				<VoteForm
					onSubmit={handleVote(
						setError,
						setVoteMessage,
						setVoted,
						setComments,
						setEmployee,
						voteForEmployee,
						employeeId,
						getEmployeeComments,
					)}
					disabled={voted}
				/>
				{voted && (
					<p className={styles.votedNote}>
						✅ Вы уже проголосовали за этого сотрудника
					</p>
				)}
			</section>

			<section className={`card ${styles.section}`}>
				<h2 className={styles.sectionTitle}>Комментарии</h2>
				<CommentList comments={comments} />
			</section>
		</div>
	);
}
