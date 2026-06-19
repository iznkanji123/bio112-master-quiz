import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { biologyQuestions } from './biology-questions';

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await query('DELETE FROM quiz_answers');
    await query('DELETE FROM quiz_sessions');
    await query('DELETE FROM bookmarks');
    await query('DELETE FROM achievements');
    await query('DELETE FROM questions');
    await query('DELETE FROM leaderboard');
    await query('DELETE FROM users');

    // Create sample users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    const adminId = uuidv4();
    await query(
      `INSERT INTO users (id, email, password, first_name, last_name, role, total_xp, current_level) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [adminId, 'admin@bio112.com', hashedPassword, 'Admin', 'User', 'admin', 5000, 10]
    );

    const studentIds = [];
    const studentEmails = [
      'john@example.com',
      'sarah@example.com',
      'mike@example.com',
      'emma@example.com',
      'alex@example.com'
    ];

    for (const email of studentEmails) {
      const userId = uuidv4();
      studentIds.push(userId);
      await query(
        `INSERT INTO users (id, email, password, first_name, last_name, role, total_xp, current_level) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, email, hashedPassword, email.split('@')[0], 'Student', 'student', Math.floor(Math.random() * 3000), Math.floor(Math.random() * 8) + 1]
      );
    }

    console.log('✅ Users seeded');

    // Insert biology questions
    console.log('📚 Inserting biology questions...');
    let questionCount = 0;
    
    for (const question of biologyQuestions) {
      await query(
        `INSERT INTO questions (question_text, category, difficulty_level, option_a, option_b, option_c, option_d, correct_answer, explanation, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          question.question,
          question.category,
          question.difficulty || 'medium',
          question.options[0],
          question.options[1],
          question.options[2],
          question.options[3],
          question.correctAnswer,
          question.explanation,
          adminId
        ]
      );
      questionCount++;
      if (questionCount % 100 === 0) {
        console.log(`  📖 ${questionCount} questions inserted...`);
      }
    }

    console.log(`✅ ${questionCount} biology questions seeded`);

    // Update leaderboard
    const leaderboardQuery = `
      INSERT INTO leaderboard (user_id, rank, total_xp, total_quizzes, average_score)
      SELECT 
        u.id,
        ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank,
        u.total_xp,
        COUNT(qs.id)::INTEGER as total_quizzes,
        COALESCE(AVG(qs.score)::NUMERIC(5,2), 0) as average_score
      FROM users u
      LEFT JOIN quiz_sessions qs ON u.id = qs.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.total_xp
      ORDER BY u.total_xp DESC
    `;
    await query(leaderboardQuery);

    console.log('✅ Leaderboard initialized');
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
