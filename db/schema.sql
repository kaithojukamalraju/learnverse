-- LearnVerse AI - Complete PostgreSQL Schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTH
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  level VARCHAR(30) NOT NULL DEFAULT 'beginner',
  xp INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_xp ON users(xp DESC);

-- ============================================
-- MODULES
-- ============================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(30),
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_modules_order ON modules(order_index);

-- ============================================
-- LESSONS
-- ============================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  content TEXT,
  content_type VARCHAR(30) NOT NULL DEFAULT 'markdown',
  video_url TEXT,
  duration_minutes INT DEFAULT 10,
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

CREATE INDEX idx_lessons_module ON lessons(module_id, order_index);

-- ============================================
-- 3D INTERACTIVE SCENES
-- ============================================
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  model_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scenes_lesson ON scenes(lesson_id);

-- ============================================
-- QUIZZES
-- ============================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
  time_limit_seconds INT DEFAULT 300,
  passing_score INT DEFAULT 70,
  max_attempts INT DEFAULT 3,
  is_adaptive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (lesson_id IS NOT NULL OR module_id IS NOT NULL)
);

CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quizzes_module ON quizzes(module_id);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
  points INT NOT NULL DEFAULT 10,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id, order_index);

-- ============================================
-- QUIZ ATTEMPTS
-- ============================================
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]',
  time_taken_seconds INT DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id, quiz_id);

-- ============================================
-- PROGRESS
-- ============================================
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  score INT DEFAULT 0,
  time_spent_minutes INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (module_id IS NOT NULL OR lesson_id IS NOT NULL)
);

CREATE UNIQUE INDEX idx_progress_user_lesson ON progress(user_id, lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX idx_progress_user_module ON progress(user_id, module_id);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  xp_reward INT NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USER ACHIEVEMENTS
-- ============================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================
-- AI CHATS
-- ============================================
CREATE TABLE ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_chats_session ON ai_chats(user_id, session_id, created_at);

-- ============================================
-- RECOMMENDATIONS
-- ============================================
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  reason TEXT,
  score DECIMAL(5,2) DEFAULT 0,
  is_viewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendations_user ON recommendations(user_id, created_at DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- ============================================
-- SEED DATA: Core Modules
-- ============================================
INSERT INTO modules (title, slug, description, icon, color, difficulty, order_index, is_published) VALUES
  ('Cell Explorer', 'cell-explorer', 'Explore the microscopic world of cell biology in 3D', 'microscope', '#22c55e', 'beginner', 1, true),
  ('Physics Lab', 'physics-lab', 'Interactive physics simulations and experiments', 'atom', '#3b82f6', 'intermediate', 2, true),
  ('Data Structures', 'data-structures', 'Visualize and master computer science fundamentals', 'code', '#a855f7', 'advanced', 3, true),
  ('Chemistry Lab', 'chemistry-lab', 'Molecular structures and chemical reactions in 3D', 'flask', '#f59e0b', 'intermediate', 4, true);

-- ============================================
-- SEED DATA: Achievements
-- ============================================
INSERT INTO achievements (title, slug, description, icon, xp_reward, criteria) VALUES
  ('First Steps', 'first-steps', 'Complete your first lesson', 'star', 50, '{"type": "lesson_complete", "count": 1}'),
  ('Quiz Master', 'quiz-master', 'Score 100% on any quiz', 'trophy', 100, '{"type": "perfect_quiz", "count": 1}'),
  ('Streak Starter', 'streak-starter', 'Maintain a 3-day learning streak', 'fire', 75, '{"type": "streak", "count": 3}'),
  ('Knowledge Seeker', 'knowledge-seeker', 'Complete 10 lessons', 'book', 200, '{"type": "lesson_complete", "count": 10}'),
  ('Speed Demon', 'speed-demon', 'Complete a quiz in under 2 minutes with 80%+ score', 'lightning', 150, '{"type": "speed_quiz", "seconds": 120, "score": 80}'),
  ('Explorer', 'explorer', 'Try all learning modules', 'compass', 300, '{"type": "modules_tried", "count": 4}');
