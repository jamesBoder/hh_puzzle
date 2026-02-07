-- +migrate Up
ALTER TABLE puzzle_attempts ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have created_at = started_at
UPDATE puzzle_attempts SET created_at = started_at WHERE created_at IS NULL;

-- +migrate Down
ALTER TABLE puzzle_attempts DROP COLUMN created_at;
