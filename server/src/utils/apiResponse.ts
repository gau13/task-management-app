import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
): Response => {
  const response: ApiResponse<T> = { success: true, data };
  if (pagination) {
    response.pagination = pagination;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode = 500): Response => {
  return res.status(statusCode).json({ success: false, message });
};
