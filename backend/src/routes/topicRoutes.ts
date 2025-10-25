import { Router } from 'express';
import { getTopics, getTopicDetails } from '../controllers/topicController';

const router = Router();

/**
 * GET /api/topics
 * Get all available topics
 * Public route
 */
router.get('/', getTopics);

/**
 * GET /api/topics/:slug
 * Get single topic details
 * Public route
 */
router.get('/:slug', getTopicDetails);

export default router;