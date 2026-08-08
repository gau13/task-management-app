import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getStats(req.user!._id);
  sendSuccess(res, stats);
});

export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const [stats, recentTasks, upcomingTasks, overdueTasks, statusDistribution] =
    await Promise.all([
      dashboardService.getStats(userId),
      dashboardService.getRecentTasks(userId),
      dashboardService.getUpcomingTasks(userId),
      dashboardService.getOverdueTasks(userId),
      dashboardService.getStatusDistribution(userId),
    ]);

  sendSuccess(res, {
    stats,
    recentTasks,
    upcomingTasks,
    overdueTasks,
    statusDistribution,
  });
});
