import { Task } from '../models/Task.js';

export const dashboardService = {
  async getStats(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [total, todo, inProgress, completed, overdue, highPriority] = await Promise.all([
      Task.countDocuments({ owner: userId }),
      Task.countDocuments({ owner: userId, status: 'TODO' }),
      Task.countDocuments({ owner: userId, status: 'IN_PROGRESS' }),
      Task.countDocuments({ owner: userId, status: 'COMPLETED' }),
      Task.countDocuments({
        owner: userId,
        dueDate: { $lt: startOfToday },
        status: { $ne: 'COMPLETED' },
      }),
      Task.countDocuments({ owner: userId, priority: 'HIGH' }),
    ]);

    return { total, todo, inProgress, completed, overdue, highPriority };
  },

  async getRecentTasks(userId: string, limit = 5) {
    return Task.find({ owner: userId }).sort({ updatedAt: -1 }).limit(limit).lean();
  },

  async getUpcomingTasks(userId: string, limit = 5) {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return Task.find({
      owner: userId,
      dueDate: { $gte: endOfToday },
      status: { $ne: 'COMPLETED' },
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean();
  },

  async getOverdueTasks(userId: string, limit = 5) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return Task.find({
      owner: userId,
      dueDate: { $lt: startOfToday },
      status: { $ne: 'COMPLETED' },
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .lean();
  },

  async getStatusDistribution(userId: string) {
    const [todo, inProgress, completed] = await Promise.all([
      Task.countDocuments({ owner: userId, status: 'TODO' }),
      Task.countDocuments({ owner: userId, status: 'IN_PROGRESS' }),
      Task.countDocuments({ owner: userId, status: 'COMPLETED' }),
    ]);

    return { TODO: todo, IN_PROGRESS: inProgress, COMPLETED: completed };
  },
};
