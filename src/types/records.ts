export type TCommentStatus = 'pending' | 'recused' | 'approved';

export interface ICommentRecord {
	id: string;
	postId: string;
	author: string;
	content: string;
	status: TCommentStatus;
}
