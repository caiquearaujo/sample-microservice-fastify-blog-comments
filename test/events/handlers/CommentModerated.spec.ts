import CommentModerated from '@/events/handlers/CommentModerated';
import CommentRepository from '@/repositories/CommentRepository';

const mockedCommentRepo = CommentRepository as jest.Mocked<
	typeof CommentRepository
>;

describe('Comment Moderated Event', () => {
	beforeEach(() => {
		CommentRepository.update = jest.fn();
	});

	afterEach(jest.clearAllMocks);

	it('should has a compatible event name', () => {
		const event = CommentModerated;
		expect(event.event()).toBe('comment.moderated');
	});

	it('should not handle the incompatible event', async () => {
		const response = await CommentModerated.handle('any.kindofevent', {
			id: 'anycommentid',
			postId: 'anypostid',
			author: 'Bruce Wayne',
			content: 'I am Batman',
			status: 'approved',
		});

		expect(response).toBeFalsy();
		expect(mockedCommentRepo.update).not.toHaveBeenCalled();
	});

	it('should handle the compatible event', async () => {
		const response = await CommentModerated.handle('comment.moderated', {
			id: 'anycommentid',
			postId: 'anypostid',
			author: 'Bruce Wayne',
			content: 'I am Batman',
			status: 'approved',
		});

		expect(response).toBe(true);
		expect(mockedCommentRepo.update).toHaveBeenCalledWith(
			'anypostid',
			'anycommentid',
			{ status: 'approved' }
		);
		expect(mockedCommentRepo.update).toHaveBeenCalledTimes(1);
	});
});
