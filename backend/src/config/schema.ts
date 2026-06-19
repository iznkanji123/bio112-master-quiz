import { query } from './database';

const createTables = async () => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        profile_picture VARCHAR(500),
        bio TEXT,
        role VARCHAR(50) DEFAULT 'student',
        is_active BOOLEAN DEFAULT true,
        total_xp INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        streak_count INTEGER DEFAULT 0,
        last_quiz_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions table
    await query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_text TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        difficulty_level VARCHAR(20) DEFAULT 'medium',
        option_a VARCHAR(255) NOT NULL,
        option_b VARCHAR(255) NOT NULL,
        option_c VARCHAR(255) NOT NULL,
        option_d VARCHAR(255) NOT NULL,
        correct_answer VARCHAR(1) NOT NULL,
        explanation TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quiz Sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        mode VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        total_questions INTEGER,
        answered_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quiz Answers table
    await query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_session_id UUID NOT NULL REFERENCES quiz_sessions(id),
        question_id UUID NOT NULL REFERENCES questions(id),
        selected_answer VARCHAR(1),
        is_correct BOOLEAN,
        time_taken_seconds INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookmarks table
    await query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        question_id UUID NOT NULL REFERENCES questions(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id)
      )
    `);

    // Achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        achievement_type VARCHAR(100) NOT NULL,
        achievement_name VARCHAR(255) NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        xp_reward INTEGER DEFAULT 0,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leaderboard table (materialized view for performance)
    await query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        rank INTEGER,
        total_xp INTEGER,
        total_quizzes INTEGER,
        average_score DECIMAL(5,2),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_quiz_answers_session ON quiz_answers(quiz_session_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank)`);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

export default createTables;
