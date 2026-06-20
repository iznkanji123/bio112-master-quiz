import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/response';

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 100, offset = 0, period = 'all' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND qs.started_at > NOW() - INTERVAL \'7 days\'';
    } else if (period === 'month') {
      dateFilter = 'AND qs.started_at > NOW() - INTERVAL \'30 days\'';
    }

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.profile_picture, u.total_xp, u.current_level, 
              COUNT(DISTINCT qs.id) as quiz_count, AVG(qs.score) as avg_score
       FROM users u 
       LEFT JOIN quiz_sessions qs ON u.id = qs.user_id AND qs.status = 'completed' ${dateFilter}
       WHERE u.role = 'student'
       GROUP BY u.id, u.first_name, u.last_name, u.profile_picture, u.total_xp, u.current_level
       ORDER BY u.total_xp DESC, avg_score DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Add rank
    const rankedLeaderboard = result.rows.map((row, index) => ({
      ...row,
      rank: (offset as number) + index + 1
    }));

    res.json(ApiResponse.success(
      { leaderboard: rankedLeaderboard },
      'Leaderboard retrieved'
    ));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve leaderboard'));
  }
};

export const getUserRank = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.total_xp, u.current_level,
              COUNT(*) as rank
       FROM users u
       JOIN users u2 ON u2.total_xp >= u.total_xp OR (u2.total_xp = u.total_xp AND u2.id <= u.id)
       WHERE u.id = $1 AND u2.role = 'student' AND u.role = 'student'
       GROUP BY u.id, u.first_name, u.last_name, u.total_xp, u.current_level`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    res.json(ApiResponse.success(result.rows[0], 'User rank retrieved'));
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve user rank'));
  }
};

export const getCategoryLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.profile_picture,
              COUNT(DISTINCT qs.id) as quiz_count, AVG(qs.score) as avg_score
       FROM users u
       JOIN quiz_sessions qs ON u.id = qs.user_id AND qs.category = $1 AND qs.status = 'completed'
       WHERE u.role = 'student'
       GROUP BY u.id, u.first_name, u.last_name, u.profile_picture
       ORDER BY avg_score DESC, quiz_count DESC
       LIMIT $2 OFFSET $3`,
      [category, limit, offset]
    );

    const rankedLeaderboard = result.rows.map((row, index) => ({
      ...row,
      rank: (offset as number) + index + 1
    }));

    res.json(ApiResponse.success(
      { leaderboard: rankedLeaderboard, category },
      'Category leaderboard retrieved'
    ));
  } catch (error) {
    console.error('Get category leaderboard error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve category leaderboard'));
  }
};
