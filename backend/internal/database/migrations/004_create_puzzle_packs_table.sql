-- +migrate Up
CREATE TABLE puzzle_packs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_type VARCHAR(50) NOT NULL,
    category_value VARCHAR(50),
    price_usd DECIMAL(10,2) NOT NULL,
    is_subscription BOOLEAN DEFAULT FALSE,
    puzzle_count INTEGER DEFAULT 0,
    cover_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_packs_category ON puzzle_packs(category_type, category_value);
CREATE INDEX idx_packs_active ON puzzle_packs(is_active);

-- +migrate Down
DROP TABLE IF EXISTS puzzle_packs CASCADE;