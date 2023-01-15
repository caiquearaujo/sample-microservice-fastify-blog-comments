import routes from '@/routes';
import CommentRepository from '@/repositories/CommentRepository';
import ApiServer from '@/server/ApiServer';
import FastifyApplierGroup from '@/server/FastifyApplierGroup';
import plugins from '@/server/plugins';
import { ICommentRecord } from '@/types/records';

beforeAll(async () => {
	const api = new ApiServer({
		routes: new FastifyApplierGroup(...routes),
		plugins: new FastifyApplierGroup(...plugins),
	});

	await api.bootstrap();
	CommentRepository.fresh();
});

describe('Comment Repository', () => {
	let postId = 'd53124d8efc6';
	let createdComment: ICommentRecord;

	it('should get empty post', () => {
		expect(CommentRepository.all(postId).length).toBe(0);
	});

	it('can add and get a comment', async () => {
		const created = await CommentRepository.create({
			postId,
			author: 'Bob',
			content: 'This is my first comment',
		});

		const found = CommentRepository.get(postId, created.id);
		expect(found).toStrictEqual(created);

		createdComment = created;
	});

	it('should get recent created comments', () => {
		const comments = CommentRepository.all(postId);

		expect(comments.length).toBe(1);
		expect(comments[0]).toStrictEqual(createdComment);
	});

	it('cannot get a comment by invalid id', () => {
		expect(CommentRepository.get(postId, 'unknown')).toBeUndefined();
	});

	it('can update a comment', async () => {
		let updatedComment = await CommentRepository.update(
			postId,
			createdComment.id,
			{
				content: 'This is my new comment',
			}
		);

		expect(updatedComment).toStrictEqual({
			postId,
			id: createdComment.id,
			author: 'Bob',
			content: 'This is my new comment',
			status: 'pending',
		});

		updatedComment = await CommentRepository.update(
			postId,
			createdComment.id,
			{
				status: 'approved',
			}
		);

		expect(updatedComment).toStrictEqual({
			postId,
			id: createdComment.id,
			author: 'Bob',
			content: 'This is my new comment',
			status: 'approved',
		});
	});

	it('cannot update an invalid post id', () => {
		expect(
			async () => await CommentRepository.update(postId, 'unknown', {})
		).rejects.toThrowError();
	});
});
