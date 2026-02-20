package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"hh_puzzle/internal/config"
	"hh_puzzle/internal/models"
)

var DB *gorm.DB

// Connect establishes a connection to the database
func Connect(cfg *config.Config) error {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.SSLMode,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✓ Database connection established")
	return nil
}

// cleanupLegacyConstraints drops PostgreSQL-default-named UNIQUE constraints that were
// created by the SQL migration files (e.g. "users_email_key"). GORM's AutoMigrate uses
// its own naming convention (e.g. "uni_users_email") and tries to DROP the GORM-named
// constraint before recreating it — which fails with SQLSTATE 42704 when only the
// PostgreSQL-named version exists. Dropping them here (with IF EXISTS) lets GORM
// recreate them under its own names on every clean startup.
func cleanupLegacyConstraints() {
	stmts := []string{
		// users table
		`ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_email_key"`,
		`ALTER TABLE IF EXISTS "users" DROP CONSTRAINT IF EXISTS "users_username_key"`,
		// user_profiles table
		`ALTER TABLE IF EXISTS "user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_user_id_key"`,
		// puzzles table
		`ALTER TABLE IF EXISTS "puzzles" DROP CONSTRAINT IF EXISTS "puzzles_daily_challenge_date_key"`,
		// purchases table
		`ALTER TABLE IF EXISTS "purchases" DROP CONSTRAINT IF EXISTS "purchases_transaction_id_key"`,
	}
	for _, stmt := range stmts {
		if err := DB.Exec(stmt).Error; err != nil {
			log.Printf("⚠️  Legacy constraint cleanup warning (safe to ignore): %v", err)
		}
	}
}

// AutoMigrate runs GORM auto-migration for all models
func AutoMigrate() error {
	// Drop PostgreSQL-default-named constraints before GORM tries to manage them
	// under its own naming convention. This prevents SQLSTATE 42704 errors.
	cleanupLegacyConstraints()

	err := DB.AutoMigrate(
		&models.User{},
		&models.UserProfile{},
		&models.OAuthAccount{},
		&models.Puzzle{},
		&models.PuzzlePack{},
		&models.PuzzleAttempt{},
		&models.Leaderboard{},
		&models.HipHopFact{},
		&models.UserUnlockedFact{},
		&models.Purchase{},
		&models.MusicTrack{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	log.Println("✓ GORM auto-migration completed")
	return nil
}

// Close closes the database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}