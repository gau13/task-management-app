import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { formatDate } from '../../utils';
import { Select } from '../ui/Select';

interface TaskTableProps {
  tasks: Task[];
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}

export function TaskTable({ tasks, onDelete, onStatusChange, onEdit }: TaskTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/tasks/${task._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3">
                  <Select
                    options={[
                      { value: 'TODO', label: 'To Do' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'COMPLETED', label: 'Completed' },
                    ]}
                    value={task.status}
                    onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
                    className="text-xs py-1"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(task.dueDate)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <Link to={`/tasks/${task._id}`} className="text-sm font-medium text-primary-600">
                {task.title}
              </Link>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-gray-400 hover:text-primary-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(task)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
            <div className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</div>
            <Select
              options={[
                { value: 'TODO', label: 'To Do' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value as TaskStatus)}
              className="text-xs"
            />
          </div>
        ))}
      </div>
    </>
  );
}
