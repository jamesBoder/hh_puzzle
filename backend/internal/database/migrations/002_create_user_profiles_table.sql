-- +migrate Up
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    total_points INTEGER DEFAULT 0,
    puzzles_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_puzzle_date DATE,
    music_enabled BOOLEAN DEFAULT TRUE,
    music_volume INTEGER DEFAULT 70,
    difficulty_preference VARCHAR(20) DEFAULT 'beginner',
    theme VARCHAR(20) DEFAULT 'dark',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_profiles_total_points ON user_profiles(total_points DESC);

-- +migrate Down
DROP TABLE IF EXISTS user_profiles CASCADE;