import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDashboardData, getStats } from '../controllers/dashboardController.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.get('/', getDashboardData);

export default router;
