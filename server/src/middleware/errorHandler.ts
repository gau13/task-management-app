import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError, sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(', ');
    return sendError(res, message, 400);
  }

  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 'Invalid ID format', 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values((err as mongoose.Error.ValidationError).errors)
      .map((e) => e.message)
      .join(', ');
    return sendError(res, message, 400);
  }

  if ((err as { code?: number }).code === 11000) {
    return sendError(res, 'Duplicate field value entered', 409);
  }

  console.error('Unexpected error:', err);
  return sendError(res, 'Internal server error', 500);
};

export const notFoundHandler = (_req: Request, res: Response): Response => {
  return sendError(res, 'Route not found', 404);
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
