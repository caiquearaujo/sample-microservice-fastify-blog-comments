import { randomBytes } from 'crypto';

import { ICommentRecord } from '@/types/records';
import ApplicationError from '@/exceptions/ApplicationError';
import EventBus from '@/events/EventBus';

let globalComments: Record<string, ICommentRecord[]> = {};

export default class CommentRepository {
	static get(postId: string, commentId: string) {
		const comments = globalComments[postId] || [];

		if (comments.length === 0) {
			return undefined;
		}

		return comments.find(comment => comment.id === commentId);
	}

	static async create(comment: Omit<ICommentRecord, 'id' | 'status'>) {
		const createdComment: ICommentRecord = {
			id: randomBytes(6).toString('hex'),
			status: 'pending',
			...comment,
		};

		if (!globalComments[comment.postId]) {
			globalComments[comment.postId] = [];
		}

		const comments = globalComments[comment.postId];
		comments.push(createdComment);
		await EventBus.emit('comment.created', createdComment);
		return createdComment;
	}

	static async update(
		postId: string,
		commentId: string,
		comment: Partial<Omit<ICommentRecord, 'id' | 'postId' | 'author'>>
	) {
		const found = CommentRepository.get(postId, commentId);

		if (!found) {
			throw new ApplicationError(
				500,
				'CannotUpdateComment',
				'Comment does not exist to be updated.'
			);
		}

		const updatedComment = {
			...found,
			content: comment.content ?? found.content,
			status: comment.status ?? found.status,
		};

		globalComments[postId].forEach((currentComment, idx) => {
			if (currentComment.id !== updatedComment.id) {
				return;
			}

			globalComments[postId][idx] = updatedComment;
		});

		await EventBus.emit('comment.updated', updatedComment);
		return updatedComment;
	}

	static all(postId: string) {
		return globalComments[postId] ?? [];
	}

	static fresh() {
		globalComments = {};
	}
}
