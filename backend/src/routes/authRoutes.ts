import { Router } from 'express';
import { signup, login, getCurrentUser, logout } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

/**
 * AUTHENTICATION ROUTES
 * Defines all auth-related API endpoints
 */

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

export default router;
