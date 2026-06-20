import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../utils/response';
import { calculateXP, calculateLevel, calculatePercentage } from '../utils/scoring';
import { v4 as uuidv4 } from 'uuid';

export const startQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const { mode, category, totalQuestions = 10 } = req.body;

    if (!mode || !['practice', 'exam'].includes(mode)) {
      return res.status(400).json(ApiResponse.error('Invalid mode'));
    }

    const sessionId = uuidv4();

    await query(
      `INSERT INTO quiz_sessions (id, user_id, mode, category, total_questions, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [sessionId, req.userId, mode, category || null, totalQuestions, 'in_progress']
    );

    res.status(201).json(ApiResponse.success(
      { sessionId },
      'Quiz session started',
      201
    ));
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to start quiz'));
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const { sessionId, questionId, selectedAnswer, timeTaken } = req.body;

    // Get correct answer
    const questionResult = await query(
      'SELECT correct_answer FROM questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Question not found'));
    }

    const isCorrect = selectedAnswer === questionResult.rows[0].correct_answer;

    await query(
      `INSERT INTO quiz_answers (id, quiz_session_id, question_id, selected_answer, is_correct, time_taken_seconds) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), sessionId, questionId, selectedAnswer, isCorrect, timeTaken || 0]
    );

    res.json(ApiResponse.success(
      { isCorrect },
      'Answer recorded'
    ));
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json(ApiResponse.error('Failed to submit answer'));
  }
};

export const endQuiz = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const { sessionId } = req.body;

    // Get quiz session and answers
    const sessionResult = await query(
      'SELECT id, total_questions FROM quiz_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json(ApiResponse.error('Quiz session not found'));
    }

    const answersResult = await query(
      'SELECT COUNT(*) as answered, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct FROM quiz_answers WHERE quiz_session_id = $1',
      [sessionId]
    );

    const answered = parseInt(answersResult.rows[0].answered);
    const correct = parseInt(answersResult.rows[0].correct) || 0;
    const score = calculatePercentage(correct, answered);

    // Update quiz session
    await query(
      `UPDATE quiz_sessions SET answered_questions = $1, correct_answers = $2, score = $3, status = $4, ended_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [answered, correct, score, 'completed', sessionId]
    );

    // Update user XP and level
    const xpGained = calculateXP(correct, answered, 'medium');
    const userResult = await query(
      'SELECT total_xp FROM users WHERE id = $1',
      [req.userId]
    );

    const newXP = (userResult.rows[0].total_xp || 0) + xpGained;
    const newLevel = calculateLevel(newXP);

    await query(
      `UPDATE users SET total_xp = $1, current_level = $2, last_quiz_date = CURRENT_TIMESTAMP WHERE id = $3`,
      [newXP, newLevel, req.userId]
    );

    res.json(ApiResponse.success(
      { score, xpGained, newLevel, correct, total: answered },
      'Quiz completed'
    ));
  } catch (error) {
    console.error('End quiz error:', error);
    res.status(500).json(ApiResponse.error('Failed to end quiz'));
  }
};

export const getQuizHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const result = await query(
      `SELECT id, mode, category, total_questions, correct_answers, score, started_at, ended_at 
       FROM quiz_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 20`,
      [req.userId]
    );

    res.json(ApiResponse.success(
      { quizzes: result.rows },
      'Quiz history retrieved'
    ));
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json(ApiResponse.error('Failed to retrieve quiz history'));
  }
};
