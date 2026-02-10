-- Add city column to puzzles table
ALTER TABLE puzzles ADD COLUMN IF NOT EXISTS city VARCHAR(50);

-- Create index on city column for better query performance
CREATE INDEX IF NOT EXISTS idx_puzzles_city ON puzzles(city);
