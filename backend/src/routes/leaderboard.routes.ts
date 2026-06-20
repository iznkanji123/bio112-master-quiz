import express, { Router } from 'express';
import {
  getLeaderboard,
  getUserRank,
  getCategoryLeaderboard
} from '../controllers/leaderboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.get('/', authenticateToken, getLeaderboard);
router.get('/rank', authenticateToken, getUserRank);
router.get('/category/:category', authenticateToken, getCategoryLeaderboard);

export default router;
