export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Comment {
  _id: string;
  task: string;
  user: { _id: string; name: string; email: string };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  highPriority: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTasks: Task[];
  upcomingTasks: Task[];
  overdueTasks: Task[];
  statusDistribution: Record<TaskStatus, number>;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  dueDateFilter?: 'today' | 'upcoming' | 'overdue';
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
}
