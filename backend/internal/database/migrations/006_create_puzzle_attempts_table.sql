-- +migrate Up
CREATE TABLE puzzle_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    current_state JSONB,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_time INTEGER,
    hints_used INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, puzzle_id)
);

CREATE INDEX idx_attempts_user_id ON puzzle_attempts(user_id);
CREATE INDEX idx_attempts_puzzle_id ON puzzle_attempts(puzzle_id);
CREATE INDEX idx_attempts_completed ON puzzle_attempts(is_completed, completed_at);
CREATE INDEX idx_attempts_points ON puzzle_attempts(points_earned DESC);

-- +migrate Down
DROP TABLE IF EXISTS puzzle_attempts CASCADE;