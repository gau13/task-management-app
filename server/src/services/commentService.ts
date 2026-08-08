import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { AuthenticatedUser } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';
import { CreateCommentInput } from '../validators/commentValidator.js';

export const commentService = {
  async getComments(userId: string, taskId: string, isAdmin = false) {
    await this.verifyTaskAccess(userId, taskId, isAdmin);

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return comments;
  },

  async createComment(
    userId: string,
    taskId: string,
    input: CreateCommentInput,
    isAdmin = false
  ) {
    await this.verifyTaskAccess(userId, taskId, isAdmin);

    const comment = await Comment.create({
      task: taskId,
      user: userId,
      content: input.content,
    });

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name email')
      .lean();

    return populated;
  },

  async deleteComment(user: AuthenticatedUser, taskId: string, commentId: string) {
    await this.verifyTaskAccess(user._id, taskId, user.role === 'admin');

    const comment = await Comment.findOne({ _id: commentId, task: taskId });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const isOwner = comment.user.toString() === user._id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('Forbidden', 403);
    }

    await Comment.findByIdAndDelete(commentId);
    return { message: 'Comment deleted successfully' };
  },

  async verifyTaskAccess(userId: string, taskId: string, isAdmin: boolean) {
    const filter: Record<string, unknown> = { _id: taskId };
    if (!isAdmin) {
      filter.owner = userId;
    }

    const task = await Task.findOne(filter);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
  },
};
