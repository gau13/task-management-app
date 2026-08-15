import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { tasksApi } from '../api/tasksApi';
import { Task, TaskFormData, TaskPriority, TaskQueryParams, TaskStatus } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../features/toast/ToastContext';
import { getErrorMessage } from '../api/axios';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/EmptyState';
import { EmptyState, LoadingSkeleton } from '../components/ui/EmptyState';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskTable } from '../components/tasks/TaskTable';
import { Pagination } from '../components/tasks/Pagination';

export function TasksPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [dueDateFilter, setDueDateFilter] = useState<'today' | 'upcoming' | 'overdue' | ''>('');
  const [sortBy, setSortBy] = useState<TaskQueryParams['sortBy']>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const queryParams: TaskQueryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined,
    priority: priority || undefined,
    dueDateFilter: dueDateFilter || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: async () => {
      const res = await tasksApi.getTasks(queryParams);
      return { tasks: res.data.data!, pagination: res.data.pagination! };
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData: TaskFormData) => tasksApi.createTask(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowCreateModal(false);
      showToast('Task created successfully', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      tasksApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditingTask(null);
      showToast('Task updated successfully', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeletingTask(null);
      showToast('Task deleted successfully', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Status updated', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    statusMutation.mutate({ id: taskId, status: newStatus });
  };

  const tasks = data?.tasks || [];
  const pagination = data?.pagination;
  const hasFilters = search || status || priority || dueDateFilter;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'TODO', label: 'To Do' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TaskStatus | '');
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
            ]}
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as TaskPriority | '');
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: '', label: 'All Due Dates' },
              { value: 'today', label: 'Today' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'overdue', label: 'Overdue' },
            ]}
            value={dueDateFilter}
            onChange={(e) => {
              setDueDateFilter(e.target.value as typeof dueDateFilter);
              setPage(1);
            }}
          />
          <Select
            options={[
              { value: 'createdAt-desc', label: 'Newest First' },
              { value: 'createdAt-asc', label: 'Oldest First' },
              { value: 'dueDate-asc', label: 'Due Date (Asc)' },
              { value: 'dueDate-desc', label: 'Due Date (Desc)' },
              { value: 'title-asc', label: 'Title (A-Z)' },
              { value: 'title-desc', label: 'Title (Z-A)' },
              { value: 'priority-desc', label: 'Priority (High-Low)' },
              { value: 'priority-asc', label: 'Priority (Low-High)' },
              { value: 'updatedAt-desc', label: 'Recently Updated' },
            ]}
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [
                TaskQueryParams['sortBy'],
                'asc' | 'desc',
              ];
              setSortBy(field);
              setSortOrder(order);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-xl border">
        {isLoading ? (
          <div className="p-4">
            <LoadingSkeleton rows={5} />
          </div>
        ) : isError ? (
          <EmptyState
            title="Failed to load tasks"
            description="Something went wrong. Please try again."
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No tasks match your search' : 'No tasks found'}
            description={
              hasFilters
                ? 'Try changing your search criteria.'
                : 'Create your first task to get started.'
            }
            action={
              !hasFilters && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              )
            }
          />
        ) : (
          <>
            <TaskTable
              tasks={tasks}
              onDelete={setDeletingTask}
              onStatusChange={handleStatusChange}
              onEdit={setEditingTask}
            />
            {pagination && (
              <div className="px-4 pb-4">
                <Pagination
                  pagination={pagination}
                  onPageChange={setPage}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Task">
        <TaskForm
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <TaskForm
            task={editingTask}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({ id: editingTask._id, data });
            }}
            onCancel={() => setEditingTask(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => deletingTask && deleteMutation.mutate(deletingTask._id)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
