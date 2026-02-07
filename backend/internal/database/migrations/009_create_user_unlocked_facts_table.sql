-- +migrate Up
CREATE TABLE user_unlocked_facts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fact_id INTEGER NOT NULL REFERENCES hip_hop_facts(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fact_id)
);

CREATE INDEX idx_unlocked_user ON user_unlocked_facts(user_id);
CREATE INDEX idx_unlocked_fact ON user_unlocked_facts(fact_id);

-- +migrate Down
DROP TABLE IF EXISTS user_unlocked_facts CASCADE;