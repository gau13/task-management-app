import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getMe, login, logout, register } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
