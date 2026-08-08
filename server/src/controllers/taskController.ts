import { Request, Response } from 'express';
import { taskService } from '../services/taskService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getParam } from '../utils/params.js';
import {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from '../validators/taskValidator.js';

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const input = createTaskSchema.parse(req.body);
  const task = await taskService.createTask(req.user!._id, input);
  sendSuccess(res, task, 201);
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const query = taskQuerySchema.parse(req.query);
  const { tasks, pagination } = await taskService.getTasks(req.user!._id, query);
  sendSuccess(res, tasks, 200, pagination);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const task = await taskService.getTaskById(req.user!._id, getParam(req.params.id), isAdmin);
  sendSuccess(res, task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const input = updateTaskSchema.parse(req.body);
  const task = await taskService.updateTask(req.user!, getParam(req.params.id), input);
  sendSuccess(res, task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.deleteTask(req.user!, getParam(req.params.id));
  sendSuccess(res, result);
});
