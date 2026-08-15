import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from '../controllers/taskController.js';
import { createComment, deleteComment, getComments } from '../controllers/commentController.js';

const router = Router();

router.use(authenticate);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/:taskId/comments', getComments);
router.post('/:taskId/comments', createComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

export default router;
