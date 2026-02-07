package main

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/lib/pq"
    "hh_puzzle/internal/config"
    "hh_puzzle/internal/database"
)

func main() {
    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("Failed to load config: %v", err)
    }

    // Connect to database
    // Build connection string for your Docker PostgreSQL
    connStr := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        cfg.Database.Host,
        cfg.Database.Port,
        cfg.Database.User,
        cfg.Database.Password,
        cfg.Database.Name,
        cfg.Database.SSLMode,
    )

    // Debug: Print connection details (without password)
    fmt.Printf("Connecting to database:\n")
    fmt.Printf("  Host: %s\n", cfg.Database.Host)
    fmt.Printf("  Port: %s\n", cfg.Database.Port)
    fmt.Printf("  User: %s\n", cfg.Database.User)
    fmt.Printf("  Database: %s\n", cfg.Database.Name)
    fmt.Printf("  Password length: %d\n", len(cfg.Database.Password))

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

    // Run migrations
    migrationsPath := "./internal/database/migrations"
    fmt.Println("\nRunning migrations...")
    
    if err := database.RunMigrations(db, migrationsPath); err != nil {
        log.Fatalf("Migration failed: %v", err)
    }

    fmt.Println("\n✓ All migrations completed successfully!")
}