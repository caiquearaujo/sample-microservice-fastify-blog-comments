import { FastifyInstance } from 'fastify';
import ApiServer from '@/server/ApiServer';
import FastifyApplierGroup from '@/server/FastifyApplierGroup';
import PostRepository from '@/repositories/CommentRepository';
import routes from '@/routes';
import { ICommentRecord } from '@/types/records';

let app: FastifyInstance;

beforeAll(async () => {
	const api = new ApiServer({
		routes: new FastifyApplierGroup(...routes),
		plugins: new FastifyApplierGroup(),
	});

	await api.bootstrap();
	app = api.app;

	PostRepository.fresh();
});

describe('Comments Routes', () => {
	let postId = 'd53124d8efc6';
	let createdComment: ICommentRecord;

	it('GET /posts/:id/comments -> should return empty comments', async () => {
		const response = await app.inject({
			method: 'GET',
			url: `/posts/${postId}/comments`,
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(404);
		expect(body).toStrictEqual({
			status: 404,
			name: 'CommentsNotFound',
			message: 'No comments were found.',
		});
	});

	it('POST /posts/:id/comments -> can create a new comment', async () => {
		const response = await app.inject({
			method: 'POST',
			url: `/posts/${postId}/comments`,
			payload: {
				author: 'Bob',
				content: 'This is my first comment',
			},
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(201);
		expect(body.postId).toBe(postId);
		expect(body.author).toBe('Bob');
		expect(body.content).toBe('This is my first comment');
		expect(body.status).toBe('pending');

		createdComment = body;
	});

	it('PUT /posts/:id/comments/:commentid -> can update an existing comment', async () => {
		const response = await app.inject({
			method: 'PUT',
			url: `/posts/${postId}/comments/${createdComment.id}`,
			payload: {
				content: 'This is my new comment',
			},
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(200);
		expect(body.postId).toBe(postId);
		expect(body.id).toBe(createdComment.id);
		expect(body.author).toBe('Bob');
		expect(body.content).toBe('This is my new comment');
		expect(body.status).toBe('pending');
	});

	it('GET /posts/:id/comments/:commentid -> can get an existing comment', async () => {
		const response = await app.inject({
			method: 'GET',
			url: `/posts/${postId}/comments/${createdComment.id}`,
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(200);
		expect(body.postId).toBe(postId);
		expect(body.id).toBe(createdComment.id);
		expect(body.author).toBe('Bob');
		expect(body.content).toBe('This is my new comment');
		expect(body.status).toBe('pending');
	});

	it('GET /posts/:id/comments/:commentid -> cannot get a post', async () => {
		const response = await app.inject({
			method: 'GET',
			url: `/posts/unknown/comments/unknown`,
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(404);
		expect(body).toStrictEqual({
			status: 404,
			name: 'CommentNotFound',
			message: 'Requested comment was not found.',
		});
	});

	it('GET /posts/:id/comments/:commentid -> cannot get a comment', async () => {
		const response = await app.inject({
			method: 'GET',
			url: `/posts/${postId}/comments/unknown`,
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(404);
		expect(body).toStrictEqual({
			status: 404,
			name: 'CommentNotFound',
			message: 'Requested comment was not found.',
		});
	});

	it('GET /posts/:id/comments/ -> can get all existing comments', async () => {
		const response = await app.inject({
			method: 'GET',
			url: `/posts/${postId}/comments`,
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(200);
		expect(body.length).toBe(1);
		expect(body[0].postId).toBe(postId);
		expect(body[0].id).toBe(createdComment.id);
		expect(body[0].author).toBe('Bob');
		expect(body[0].content).toBe('This is my new comment');
		expect(body[0].status).toBe('pending');
	});
});
