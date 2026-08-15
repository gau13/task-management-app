import { FilterQuery } from 'mongoose';
import { ITask, Task } from '../models/Task.js';
import { AuthenticatedUser, PaginationMeta } from '../types/index.js';
import { AppError } from '../utils/apiResponse.js';
import { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from '../validators/taskValidator.js';

const priorityOrder: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

const buildDueDateFilter = (dueDateFilter: string | undefined): FilterQuery<ITask> | null => {
  if (!dueDateFilter) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  switch (dueDateFilter) {
    case 'today':
      return { dueDate: { $gte: startOfToday, $lt: endOfToday } };
    case 'upcoming':
      return { dueDate: { $gte: endOfToday }, status: { $ne: 'COMPLETED' } };
    case 'overdue':
      return { dueDate: { $lt: startOfToday }, status: { $ne: 'COMPLETED' } };
    default:
      return null;
  }
};

export const taskService = {
  async createTask(userId: string, input: CreateTaskInput) {
    const taskData: Partial<ITask> = {
      title: input.title,
      description: input.description || '',
      status: input.status || 'TODO',
      priority: input.priority || 'MEDIUM',
      owner: userId as unknown as ITask['owner'],
    };

    if (input.dueDate) {
      taskData.dueDate = new Date(input.dueDate);
    }

    if (taskData.status === 'COMPLETED') {
      taskData.completedAt = new Date();
    }

    const task = await Task.create(taskData);
    return task.toObject();
  },

  async getTasks(userId: string, query: TaskQueryInput) {
    const filter: FilterQuery<ITask> = { owner: userId };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const dueDateFilter = buildDueDateFilter(query.dueDateFilter);
    if (dueDateFilter) {
      Object.assign(filter, dueDateFilter);
    }

    const sortField = query.sortBy;
    const sortOptions: Record<string, 1 | -1> = {
      [sortField]: query.sortOrder === 'asc' ? 1 : -1,
    };

    if (sortField === 'priority') {
      const tasks = await Task.find(filter).lean();
      const sorted = tasks.sort((a, b) => {
        const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return query.sortOrder === 'asc' ? diff : -diff;
      });

      const total = sorted.length;
      const skip = (query.page - 1) * query.limit;
      const paginatedTasks = sorted.slice(skip, skip + query.limit);

      const pagination: PaginationMeta = {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      };

      return { tasks: paginatedTasks, pagination };
    }

    const skip = (query.page - 1) * query.limit;
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortOptions).skip(skip).limit(query.limit).lean(),
      Task.countDocuments(filter),
    ]);

    const pagination: PaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };

    return { tasks, pagination };
  },

  async getTaskById(userId: string, taskId: string, isAdmin = false) {
    const filter: FilterQuery<ITask> = { _id: taskId };
    if (!isAdmin) {
      filter.owner = userId;
    }

    const task = await Task.findOne(filter).lean();
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  },

  async updateTask(user: AuthenticatedUser, taskId: string, input: UpdateTaskInput) {
    const filter: FilterQuery<ITask> = { _id: taskId };
    if (user.role !== 'admin') {
      filter.owner = user._id;
    }

    const task = await Task.findOne(filter);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority !== undefined) task.priority = input.priority;

    if (input.dueDate !== undefined) {
      task.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
    }

    if (input.status !== undefined) {
      task.status = input.status;
      if (input.status === 'COMPLETED') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();
    return task.toObject();
  },

  async deleteTask(user: AuthenticatedUser, taskId: string) {
    const filter: FilterQuery<ITask> = { _id: taskId };
    if (user.role !== 'admin') {
      filter.owner = user._id;
    }

    const task = await Task.findOneAndDelete(filter);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return { message: 'Task deleted successfully' };
  },
};
