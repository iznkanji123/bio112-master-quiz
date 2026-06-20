import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/response';
import { hashPassword } from '../utils/jwt';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, profile_picture, bio, role, total_xp, current_level, streak_count, created_at 
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    res.json(ApiResponse.success(result.rows[0], 'Profile retrieved'));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve profile'));
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const { firstName, lastName, bio, profilePicture } = req.body;

    await query(
      `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), 
       bio = COALESCE($3, bio), profile_picture = COALESCE($4, profile_picture), updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [firstName || null, lastName || null, bio || null, profilePicture || null, req.userId]
    );

    const result = await query(
      'SELECT id, email, first_name, last_name, profile_picture, bio FROM users WHERE id = $1',
      [req.userId]
    );

    res.json(ApiResponse.success(result.rows[0], 'Profile updated'));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(ApiResponse.error('Failed to update profile'));
  }
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const userResult = await query(
      'SELECT total_xp, current_level, streak_count FROM users WHERE id = $1',
      [req.userId]
    );

    const quizzesResult = await query(
      `SELECT COUNT(*) as total_quizzes, AVG(score) as avg_score, MAX(score) as best_score 
       FROM quiz_sessions WHERE user_id = $1 AND status = 'completed'`,
      [req.userId]
    );

    const categoryResult = await query(
      `SELECT category, COUNT(*) as count, AVG(qs.score) as avg_score 
       FROM quiz_sessions qs WHERE qs.user_id = $1 GROUP BY category`,
      [req.userId]
    );

    const stats = {
      ...userResult.rows[0],
      ...quizzesResult.rows[0],
      byCategory: categoryResult.rows
    };

    res.json(ApiResponse.success(stats, 'Statistics retrieved'));
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve statistics'));
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const result = await query(
      `SELECT q.* FROM questions q 
       INNER JOIN bookmarks b ON q.id = b.question_id 
       WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
      [req.userId]
    );

    res.json(ApiResponse.success({ bookmarks: result.rows }, 'Bookmarks retrieved'));
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve bookmarks'));
  }
};

export const addBookmark = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json(ApiResponse.error('Question ID required'));
    }

    // Check if already bookmarked
    const existingResult = await query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND question_id = $2',
      [req.userId, questionId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json(ApiResponse.error('Already bookmarked'));
    }

    const { v4: uuidv4 } = require('uuid');
    await query(
      'INSERT INTO bookmarks (id, user_id, question_id) VALUES ($1, $2, $3)',
      [uuidv4(), req.userId, questionId]
    );

    res.status(201).json(ApiResponse.success(null, 'Bookmark added', 201));
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json(ApiResponse.error('Failed to add bookmark'));
  }
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const { questionId } = req.body;

    await query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND question_id = $2',
      [req.userId, questionId]
    );

    res.json(ApiResponse.success(null, 'Bookmark removed'));
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json(ApiResponse.error('Failed to remove bookmark'));
  }
};
