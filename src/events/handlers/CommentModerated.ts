import CommentRepository from '@/repositories/CommentRepository';
import { IEventHandler } from '@/types/classes';
import { ICommentRecord } from '@/types/records';

class CommentModerated implements IEventHandler<ICommentRecord> {
	protected name;

	constructor() {
		this.name = 'comment.moderated';
	}

	public event() {
		return this.name;
	}

	public async handle(event: string, payload: ICommentRecord) {
		if (event !== this.name) return false;

		const { postId, id, status } = payload;
		await CommentRepository.update(postId, id, { status });
		return true;
	}
}

export default new CommentModerated();
