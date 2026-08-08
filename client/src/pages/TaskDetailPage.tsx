import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { tasksApi, commentsApi } from '../api/tasksApi';
import { TaskFormData, TaskStatus } from '../types';
import { useToast } from '../features/toast/ToastContext';
import { getErrorMessage } from '../api/axios';
import { formatDate, formatDateTime } from '../utils';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { TaskForm } from '../components/tasks/TaskForm';
import { useAuth } from '../features/auth/AuthContext';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await tasksApi.getTask(id!);
      return res.data.data!;
    },
    enabled: !!id,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await commentsApi.getComments(id!);
      return res.data.data!;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TaskFormData>) => tasksApi.updateTask(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowEditModal(false);
      showToast('Task updated successfully', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.deleteTask(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Task deleted successfully', 'success');
      navigate('/tasks');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.createComment(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentText('');
      showToast('Comment added', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(id!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      showToast('Comment deleted', 'success');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  if (isLoading) {
    return (
      <div>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <EmptyState
        title="Task not found"
        description="The task you're looking for doesn't exist or you don't have access."
        action={
          <Link to="/tasks">
            <Button variant="secondary">Back to Tasks</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Comments</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) {
                  commentMutation.mutate(commentText.trim());
                }
              }}
              className="mb-6"
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
              <Button
                type="submit"
                size="sm"
                className="mt-2"
                isLoading={commentMutation.isPending}
                disabled={!commentText.trim()}
              >
                Add Comment
              </Button>
            </form>

            {commentsLoading ? (
              <LoadingSkeleton rows={2} />
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {comment.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(comment.createdAt)}
                        </p>
                      </div>
                      {(comment.user._id === user?._id || user?.role === 'admin') && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                          disabled={deleteCommentMutation.isPending}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1">
                  <Select
                    options={[
                      { value: 'TODO', label: 'To Do' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'COMPLETED', label: 'Completed' },
                    ]}
                    value={task.status}
                    onChange={(e) =>
                      updateMutation.mutate({ status: e.target.value as TaskStatus })
                    }
                  />
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Due Date</dt>
                <dd className="font-medium text-gray-900">{formatDate(task.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">{formatDateTime(task.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Updated</dt>
                <dd className="font-medium text-gray-900">{formatDateTime(task.updatedAt)}</dd>
              </div>
              {task.completedAt && (
                <div>
                  <dt className="text-gray-500">Completed</dt>
                  <dd className="font-medium text-gray-900">{formatDateTime(task.completedAt)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Task">
        <TaskForm
          task={task}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
          onCancel={() => setShowEditModal(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
