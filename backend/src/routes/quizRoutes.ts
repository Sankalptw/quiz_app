import { Router } from 'express';
import { startQuiz, submitQuiz, getQuizHistory, getStats } from '../controllers/quizController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/quiz/start/:topicSlug
 * Start a new quiz for a topic
 * Optional authentication (can be played as guest or logged in)
 */
router.get('/start/:topicSlug', startQuiz);

/**
 * POST /api/quiz/submit
 * Submit quiz answers and get results
 * Protected route - requires authentication to save results
 */
router.post('/submit', authenticate, submitQuiz);

/**
 * GET /api/quiz/history
 * Get user's quiz attempt history
 * Protected route
 */
router.get('/history', authenticate, getQuizHistory);

/**
 * GET /api/quiz/stats
 * Get user's overall statistics
 * Protected route
 */
router.get('/stats', authenticate, getStats);

export default router;