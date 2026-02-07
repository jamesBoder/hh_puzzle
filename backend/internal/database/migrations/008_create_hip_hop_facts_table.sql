-- +migrate Up
CREATE TABLE hip_hop_facts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    unlock_type VARCHAR(50),
    unlock_value INTEGER,
    image_url VARCHAR(500),
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facts_category ON hip_hop_facts(category);
CREATE INDEX idx_facts_unlock ON hip_hop_facts(unlock_type, unlock_value);

-- +migrate Down
DROP TABLE IF EXISTS hip_hop_facts CASCADE;