import commonRouter from './common.router';
import commentsRouter from './comments.router';
import webhookRouter from './webhooks.router';

export default [
	commonRouter,
	webhookRouter.webhookToEvents,
	commentsRouter.createComment,
	commentsRouter.getComment,
	commentsRouter.listComment,
	commentsRouter.updateComment,
];
