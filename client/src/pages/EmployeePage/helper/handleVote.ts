import type { Dispatch, SetStateAction } from 'react';
import type { Comment, EmployeeDetail, VoteType } from '../../../types';

type VoteForEmployee = (
	employeeId: number,
	type: VoteType,
	comment?: string,
) => Promise<{ likes: number; dislikes: number }>;

type GetEmployeeComments = (employeeId: number) => Promise<Comment[]>;

export function handleVote(
	setError: Dispatch<SetStateAction<string>>,
	setVoteMessage: Dispatch<SetStateAction<string>>,
	setVoted: Dispatch<SetStateAction<boolean>>,
	setComments: Dispatch<SetStateAction<Comment[]>>,
	setEmployee: Dispatch<SetStateAction<EmployeeDetail | null>>,
	voteForEmployee: VoteForEmployee,
	employeeId: number,
	getEmployeeComments: GetEmployeeComments,
) {
	return async (type: VoteType, comment: string) => {
		setVoteMessage('');
		setError('');
		try {
			const result = await voteForEmployee(employeeId, type, comment || undefined);
			setEmployee(prev =>
				prev
					? { ...prev, likes: result.likes, dislikes: result.dislikes }
					: prev,
			);
			setVoted(true);
			setVoteMessage('Голос учтён!');
			if (comment) {
				const comms = await getEmployeeComments(employeeId);
				setComments(comms);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка голосования');
		}
	};
}
