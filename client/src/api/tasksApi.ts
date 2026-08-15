import { api } from './axios';
import {
  ApiResponse,
  Comment,
  DashboardData,
  DashboardStats,
  Task,
  TaskFormData,
  TaskQueryParams,
} from '../types';

export const tasksApi = {
  getTasks: (params: TaskQueryParams) => api.get<ApiResponse<Task[]>>('/tasks', { params }),

  getTask: (id: string) => api.get<ApiResponse<Task>>(`/tasks/${id}`),

  createTask: (data: TaskFormData) => api.post<ApiResponse<Task>>('/tasks', data),

  updateTask: (id: string, data: Partial<TaskFormData>) =>
    api.patch<ApiResponse<Task>>(`/tasks/${id}`, data),

  deleteTask: (id: string) => api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`),
};

export const commentsApi = {
  getComments: (taskId: string) => api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`),

  createComment: (taskId: string, content: string) =>
    api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content }),

  deleteComment: (taskId: string, commentId: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/tasks/${taskId}/comments/${commentId}`),
};

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  getDashboard: () => api.get<ApiResponse<DashboardData>>('/dashboard'),
};
