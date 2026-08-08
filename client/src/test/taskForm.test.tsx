import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../components/tasks/TaskForm';

describe('TaskForm', () => {
  it('renders all form fields', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('populates form when editing', () => {
    const onSubmit = vi.fn();
    render(
      <TaskForm
        task={{
          _id: '1',
          title: 'Existing Task',
          description: 'Description',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: '2026-08-20',
          owner: 'user1',
          createdAt: '2026-08-01',
          updatedAt: '2026-08-01',
        }}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });
});
