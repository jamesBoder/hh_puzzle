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

// AutoMigrate runs GORM auto-migration for all models

func AutoMigrate() error {
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