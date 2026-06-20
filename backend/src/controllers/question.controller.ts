import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/response';
import { v4 as uuidv4 } from 'uuid';

export const getAllQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT id, question_text, category, difficulty_level, option_a, option_b, option_c, option_d FROM questions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      sql += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (difficulty) {
      sql += ` AND difficulty_level = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    res.json(ApiResponse.success(
      { questions: result.rows, total: result.rows.length },
      'Questions retrieved'
    ));
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve questions'));
  }
};

export const getQuestionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Question not found'));
    }

    res.json(ApiResponse.success(result.rows[0], 'Question retrieved'));
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve question'));
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT DISTINCT category FROM questions ORDER BY category'
    );

    res.json(ApiResponse.success(
      { categories: result.rows.map(r => r.category) },
      'Categories retrieved'
    ));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve categories'));
  }
};
