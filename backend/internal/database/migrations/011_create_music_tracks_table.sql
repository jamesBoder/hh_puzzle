-- +migrate Up
CREATE TABLE music_tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(200),
    file_url VARCHAR(500) NOT NULL,
    file_size_kb INTEGER,
    duration_seconds INTEGER,
    genre VARCHAR(50) DEFAULT 'hip-hop',
    mood VARCHAR(50),
    bpm INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracks_active ON music_tracks(is_active);
CREATE INDEX idx_tracks_mood ON music_tracks(mood);

-- +migrate Down
DROP TABLE IF EXISTS music_tracks CASCADE;