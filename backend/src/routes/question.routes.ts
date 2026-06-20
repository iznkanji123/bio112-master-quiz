import express, { Router } from 'express';
import { getAllQuestions, getQuestionById, getCategories } from '../controllers/question.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.get('/', authenticateToken, getAllQuestions);
router.get('/categories', authenticateToken, getCategories);
router.get('/:id', authenticateToken, getQuestionById);

export default router;
