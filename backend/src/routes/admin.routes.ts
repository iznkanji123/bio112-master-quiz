import express, { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getSystemStats
} from '../controllers/admin.controller';
import { authenticateToken, authorize } from '../middleware/auth.middleware';

const router: Router = express.Router();

// Apply admin authorization to all routes
router.use(authenticateToken, authorize(['admin']));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Question management
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// System statistics
router.get('/stats', getSystemStats);

export default router;
