-- +migrate Up
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_pack_id INTEGER REFERENCES puzzle_packs(id) ON DELETE SET NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    is_subscription BOOLEAN DEFAULT FALSE,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    subscription_status VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_pack ON purchases(puzzle_pack_id);
CREATE INDEX idx_purchases_transaction ON purchases(transaction_id);
CREATE INDEX idx_purchases_subscription ON purchases(is_subscription, subscription_status);

-- +migrate Down
DROP TABLE IF EXISTS purchases CASCADE;