import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CircleDot,
} from 'lucide-react';
import { dashboardApi } from '../api/tasksApi';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils';
import { TaskStatus } from '../types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function StatusChart({ distribution }: { distribution: Record<TaskStatus, number> }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const items = [
    { key: 'TODO' as TaskStatus, label: 'To Do', color: 'bg-gray-400' },
    { key: 'IN_PROGRESS' as TaskStatus, label: 'In Progress', color: 'bg-blue-500' },
    { key: 'COMPLETED' as TaskStatus, label: 'Completed', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex h-4 rounded-full overflow-hidden">
        {items.map(({ key, color }) => (
          <div
            key={key}
            className={`${color} transition-all`}
            style={{ width: `${(distribution[key] / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ key, label, color }) => (
          <div key={key} className="text-center">
            <div className={`inline-block w-3 h-3 rounded-full ${color} mr-1`} />
            <span className="text-xs text-gray-600">{label}</span>
            <p className="text-lg font-semibold">{distribution[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskListSection({
  title,
  tasks,
  emptyMessage,
}: {
  title: string;
  tasks: { _id: string; title: string; status: TaskStatus; priority: string; dueDate?: string }[];
  emptyMessage: string;
}) {
  return (
    <div className="bg-white rounded-xl border">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y">
        {tasks.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-500 text-center">{emptyMessage}</p>
        ) : (
          tasks.map((task) => (
            <Link
              key={task._id}
              to={`/tasks/${task._id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">Due: {formatDate(task.dueDate)}</p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <PriorityBadge priority={task.priority as 'LOW' | 'MEDIUM' | 'HIGH'} />
                <StatusBadge status={task.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data!;
    },
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
        <LoadingSkeleton rows={3} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description="Something went wrong while loading your dashboard data."
      />
    );
  }

  const { stats, recentTasks, upcomingTasks, overdueTasks, statusDistribution } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="bg-blue-50 text-blue-600" />
        <StatCard label="To Do" value={stats.todo} icon={CircleDot} color="bg-gray-100 text-gray-600" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="bg-blue-50 text-blue-600" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-green-50 text-green-600" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} color="bg-red-50 text-red-600" />
        <StatCard label="High Priority" value={stats.highPriority} icon={Flame} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Task Distribution</h3>
          <StatusChart distribution={statusDistribution} />
        </div>
        <TaskListSection
          title="Recent Tasks"
          tasks={recentTasks}
          emptyMessage="No recent tasks."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskListSection
          title="Upcoming Tasks"
          tasks={upcomingTasks}
          emptyMessage="No upcoming tasks."
        />
        <TaskListSection
          title="Overdue Tasks"
          tasks={overdueTasks}
          emptyMessage="No overdue tasks. Great job!"
        />
      </div>
    </div>
  );
}
