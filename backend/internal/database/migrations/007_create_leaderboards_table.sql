-- +migrate Up
CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_points INTEGER DEFAULT 0,
    puzzles_completed INTEGER DEFAULT 0,
    average_completion_time INTEGER,
    rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

CREATE INDEX idx_leaderboard_week ON leaderboards(week_start_date, week_end_date);
CREATE INDEX idx_leaderboard_rank ON leaderboards(week_start_date, rank);
CREATE INDEX idx_leaderboard_user ON leaderboards(user_id);

-- +migrate Down
DROP TABLE IF EXISTS leaderboards CASCADE;