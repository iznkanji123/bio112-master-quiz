import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/response';
import { authorize } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT id, email, first_name, last_name, role, total_xp, current_level, created_at FROM users WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (role) {
      sql += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    sql += ` ORDER BY total_xp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const countResult = await query('SELECT COUNT(*) as total FROM users');

    res.json(ApiResponse.success(
      { users: result.rows, total: countResult.rows[0].total },
      'Users retrieved'
    ));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve users'));
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, email, first_name, last_name, role, total_xp, current_level, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('User not found'));
    }

    res.json(ApiResponse.success(result.rows[0], 'User retrieved'));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve user'));
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json(ApiResponse.error('Invalid role'));
    }

    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);

    res.json(ApiResponse.success(null, 'User role updated'));
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json(ApiResponse.error('Failed to update user role'));
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM users WHERE id = $1', [id]);

    res.json(ApiResponse.success(null, 'User deleted'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(ApiResponse.error('Failed to delete user'));
  }
};

export const createQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { questionText, category, difficultyLevel, options, correctAnswer, explanation } = req.body;

    if (!questionText || !category || !options || !correctAnswer) {
      return res.status(400).json(ApiResponse.error('Missing required fields'));
    }

    if (options.length !== 4) {
      return res.status(400).json(ApiResponse.error('Must have exactly 4 options'));
    }

    const questionId = uuidv4();

    await query(
      `INSERT INTO questions (id, question_text, category, difficulty_level, option_a, option_b, option_c, option_d, correct_answer, explanation, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [questionId, questionText, category, difficultyLevel || 'medium', options[0], options[1], options[2], options[3], correctAnswer, explanation || '', req.userId]
    );

    res.status(201).json(ApiResponse.success(
      { questionId },
      'Question created',
      201
    ));
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json(ApiResponse.error('Failed to create question'));
  }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { questionText, category, difficultyLevel, options, correctAnswer, explanation } = req.body;

    await query(
      `UPDATE questions SET question_text = COALESCE($1, question_text), category = COALESCE($2, category), 
       difficulty_level = COALESCE($3, difficulty_level), option_a = COALESCE($4, option_a), 
       option_b = COALESCE($5, option_b), option_c = COALESCE($6, option_c), option_d = COALESCE($7, option_d), 
       correct_answer = COALESCE($8, correct_answer), explanation = COALESCE($9, explanation), updated_at = CURRENT_TIMESTAMP 
       WHERE id = $10`,
      [questionText || null, category || null, difficultyLevel || null, options?.[0] || null, options?.[1] || null, options?.[2] || null, options?.[3] || null, correctAnswer || null, explanation || null, id]
    );

    res.json(ApiResponse.success(null, 'Question updated'));
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json(ApiResponse.error('Failed to update question'));
  }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM questions WHERE id = $1', [id]);

    res.json(ApiResponse.success(null, 'Question deleted'));
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json(ApiResponse.error('Failed to delete question'));
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsersResult = await query('SELECT COUNT(*) as total FROM users');
    const totalQuestionsResult = await query('SELECT COUNT(*) as total FROM questions');
    const totalQuizzesResult = await query('SELECT COUNT(*) as total FROM quiz_sessions');
    const activeUsersResult = await query(
      'SELECT COUNT(DISTINCT user_id) as total FROM quiz_sessions WHERE started_at > NOW() - INTERVAL \'7 days\''
    );

    const stats = {
      totalUsers: totalUsersResult.rows[0].total,
      totalQuestions: totalQuestionsResult.rows[0].total,
      totalQuizzes: totalQuizzesResult.rows[0].total,
      activeUsers: activeUsersResult.rows[0].total
    };

    res.json(ApiResponse.success(stats, 'System statistics retrieved'));
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve system statistics'));
  }
};
