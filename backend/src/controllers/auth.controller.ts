import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateToken, hashPassword, comparePassword } from '../utils/jwt';
import { validateEmail, validatePassword } from '../utils/validators';
import { ApiResponse } from '../utils/response';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(ApiResponse.error('Email and password required'));
    }

    if (!validateEmail(email)) {
      return res.status(400).json(ApiResponse.error('Invalid email format'));
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      return res.status(400).json(ApiResponse.error(`Password requirements: ${pwValidation.errors.join(', ')}`));
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json(ApiResponse.error('Email already registered'));
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    await query(
      `INSERT INTO users (id, email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, hashedPassword, firstName || '', lastName || '', 'student']
    );

    const token = generateToken(userId, 'student');

    res.status(201).json(ApiResponse.success(
      { userId, email, token },
      'Registration successful',
      201
    ));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(ApiResponse.error('Registration failed'));
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(ApiResponse.error('Email and password required'));
    }

    const result = await query(
      'SELECT id, email, password, role, first_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json(ApiResponse.error('Invalid credentials'));
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json(ApiResponse.error('Invalid credentials'));
    }

    const token = generateToken(user.id, user.role);

    res.json(ApiResponse.success(
      {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        token
      },
      'Login successful'
    ));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(ApiResponse.error('Login failed'));
  }
};

export const logout = (req: AuthRequest, res: Response) => {
  res.json(ApiResponse.success(null, 'Logout successful'));
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json(ApiResponse.error('Not authenticated'));
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, profile_picture, bio, role, total_xp, current_level, streak_count 
       FROM users WHERE id = $1`,
      [req.userId]
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
