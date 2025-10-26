import { Router } from 'express';
import {
  getGlobalLeaderboard,
  getTodayLeaderboard,
  getTopicLeaderboard,
  getUserRank,
} from '../controllers/leaderboardController';

const router = Router();

router.get('/global', getGlobalLeaderboard);
router.get('/today', getTodayLeaderboard);
router.get('/topic/:topicId', getTopicLeaderboard);
router.get('/user/:userId', getUserRank);

export default router;