import { FastifyInstance } from 'fastify';
import { TFnApplyToFastify } from '@/types/types';
import CommentRepository from '@/repositories/CommentRepository';

const createComment: TFnApplyToFastify = async (app: FastifyInstance) => {
	app.post('/posts/:id/comments', async (request, reply) => {
		const { id } = request.params as any;
		const { author, content } = request.body as any;

		return reply
			.status(201)
			.send(
				await CommentRepository.create({ postId: id, author, content })
			);
	});
};

const updateComment: TFnApplyToFastify = async (app: FastifyInstance) => {
	app.put('/posts/:id/comments/:commentId', async (request, reply) => {
		const { id, commentId } = request.params as any;
		const { content } = request.body as any;

		const comment = await CommentRepository.update(id, commentId, {
			content,
		});

		return reply.status(200).send(comment);
	});
};

const getComment: TFnApplyToFastify = async (app: FastifyInstance) => {
	app.get('/posts/:id/comments/:commentId', (request, reply) => {
		const { id, commentId } = request.params as any;

		const comment = CommentRepository.get(id, commentId);

		if (!comment) {
			return reply.status(404).send({
				status: 404,
				name: 'CommentNotFound',
				message: 'Requested comment was not found.',
			});
		}

		return reply.status(200).send(comment);
	});
};

const listComment: TFnApplyToFastify = async (app: FastifyInstance) => {
	app.get('/posts/:id/comments', (request, reply) => {
		const { id } = request.params as any;
		const comments = CommentRepository.all(id);

		if (comments.length === 0) {
			return reply.status(404).send({
				status: 404,
				name: 'CommentsNotFound',
				message: 'No comments were found.',
			});
		}

		return reply.status(200).send(comments);
	});
};

export default { getComment, listComment, createComment, updateComment };
