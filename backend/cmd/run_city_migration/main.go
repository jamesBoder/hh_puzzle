package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"hh_puzzle/internal/config"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Connected to database successfully!")

	// Run the city migration
	fmt.Println("\nAdding city column to puzzles table...")
	
	_, err = db.Exec(`ALTER TABLE puzzles ADD COLUMN IF NOT EXISTS city VARCHAR(50);`)
	if err != nil {
		log.Fatalf("Failed to add city column: %v", err)
	}
	
	fmt.Println("✓ City column added successfully!")
	
	fmt.Println("\nCreating index on city column...")
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_puzzles_city ON puzzles(city);`)
	if err != nil {
		log.Fatalf("Failed to create index: %v", err)
	}
	
	fmt.Println("✓ Index created successfully!")
	fmt.Println("\n✓ Migration completed!")
}
