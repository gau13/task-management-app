import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TasksPage } from '../pages/TasksPage';
import { ToastProvider } from '../features/toast/ToastContext';

vi.mock('../api/tasksApi', () => ({
  tasksApi: {
    getTasks: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            _id: '1',
            title: 'Fix login',
            description: 'Fix auth bug',
            status: 'TODO',
            priority: 'HIGH',
            dueDate: '2026-08-10',
            owner: 'user1',
            createdAt: '2026-08-01',
            updatedAt: '2026-08-01',
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    }),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const renderTasksPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>
          <TasksPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task list', async () => {
    renderTasksPage();

    await waitFor(() => {
      expect(screen.getAllByText('Fix login').length).toBeGreaterThan(0);
    });
  });

  it('renders search input', () => {
    renderTasksPage();
    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
  });

  it('opens create task modal', async () => {
    const user = userEvent.setup();
    renderTasksPage();

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no tasks', async () => {
    const { tasksApi } = await import('../api/tasksApi');
    vi.mocked(tasksApi.getTasks).mockResolvedValueOnce({
      data: {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      },
    } as never);

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    });
  });
});
