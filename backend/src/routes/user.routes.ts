import express, { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getStatistics,
  getBookmarks,
  addBookmark,
  removeBookmark
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.get('/statistics', authenticateToken, getStatistics);
router.get('/bookmarks', authenticateToken, getBookmarks);
router.post('/bookmarks', authenticateToken, addBookmark);
router.delete('/bookmarks', authenticateToken, removeBookmark);

export default router;
