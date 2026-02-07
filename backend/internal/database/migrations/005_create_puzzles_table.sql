-- +migrate Up
CREATE TABLE puzzles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    grid_data JSONB NOT NULL,
    clues_across JSONB NOT NULL,
    clues_down JSONB NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    decade VARCHAR(10),
    region VARCHAR(50),
    subgenre VARCHAR(50),
    estimated_time INTEGER,
    base_points INTEGER DEFAULT 100,
    is_daily_challenge BOOLEAN DEFAULT FALSE,
    daily_challenge_date DATE UNIQUE,
    puzzle_pack_id INTEGER REFERENCES puzzle_packs(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX idx_puzzles_decade ON puzzles(decade);
CREATE INDEX idx_puzzles_region ON puzzles(region);
CREATE INDEX idx_puzzles_daily_challenge ON puzzles(is_daily_challenge, daily_challenge_date);
CREATE INDEX idx_puzzles_pack ON puzzles(puzzle_pack_id);
CREATE INDEX idx_puzzles_deleted_at ON puzzles(deleted_at);

-- +migrate Down
DROP TABLE IF EXISTS puzzles CASCADE;