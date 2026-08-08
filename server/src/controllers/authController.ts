import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { loginSchema, registerSchema } from '../validators/authValidator.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  sendSuccess(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  sendSuccess(res, result);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!._id);
  sendSuccess(res, user);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { message: 'Logged out successfully' });
});
