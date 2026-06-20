import express, { Router } from 'express';
import { startQuiz, submitAnswer, endQuiz, getQuizHistory } from '../controllers/quiz.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.post('/start', authenticateToken, startQuiz);
router.post('/answer', authenticateToken, submitAnswer);
router.post('/end', authenticateToken, endQuiz);
router.get('/history', authenticateToken, getQuizHistory);

export default router;
