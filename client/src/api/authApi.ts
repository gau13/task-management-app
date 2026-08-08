import { api } from './axios';
import { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  getMe: () => api.get<ApiResponse<User>>('/auth/me'),

  logout: () => api.post<ApiResponse<{ message: string }>>('/auth/logout'),
};
