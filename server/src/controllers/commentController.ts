import { Request, Response } from 'express';
import { commentService } from '../services/commentService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getParam } from '../utils/params.js';
import { createCommentSchema } from '../validators/commentValidator.js';

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const comments = await commentService.getComments(
    req.user!._id,
    getParam(req.params.taskId),
    isAdmin
  );
  sendSuccess(res, comments);
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const input = createCommentSchema.parse(req.body);
  const isAdmin = req.user!.role === 'admin';
  const comment = await commentService.createComment(
    req.user!._id,
    getParam(req.params.taskId),
    input,
    isAdmin
  );
  sendSuccess(res, comment, 201);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const result = await commentService.deleteComment(
    req.user!,
    getParam(req.params.taskId),
    getParam(req.params.commentId)
  );
  sendSuccess(res, result);
});
