package repository

import (
	"errors"
	"time"

	"gorm.io/gorm"
	"hh_puzzle/internal/models"
)

// PuzzleRepository defines methods for puzzle data access
type PuzzleRepository interface {
	Create(puzzle *models.Puzzle) error
	FindByID(id uint) (*models.Puzzle, error)
	FindDailyChallenge(date time.Time) (*models.Puzzle, error)
	FindByFilters(difficulty, decade, region string, limit, offset int) ([]models.Puzzle, error)
	Update(puzzle *models.Puzzle) error
	Delete(id uint) error
	Count() (int64, error)
}

type puzzleRepository struct {
	db *gorm.DB
}

// NewPuzzleRepository creates a new puzzle repository
func NewPuzzleRepository(db *gorm.DB) PuzzleRepository {
	return &puzzleRepository{db: db}
}

func (r *puzzleRepository) Create(puzzle *models.Puzzle) error {
	return r.db.Create(puzzle).Error
}

func (r *puzzleRepository) FindByID(id uint) (*models.Puzzle, error) {
	var puzzle models.Puzzle
	err := r.db.Preload("PuzzlePack").First(&puzzle, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("puzzle not found")
		}
		return nil, err
	}
	return &puzzle, nil
}

func (r *puzzleRepository) FindDailyChallenge(date time.Time) (*models.Puzzle, error) {
	var puzzle models.Puzzle
	err := r.db.Where("is_daily_challenge = ? AND DATE(daily_challenge_date) = DATE(?)", true, date).First(&puzzle).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("no daily challenge found for this date")
		}
		return nil, err
	}
	return &puzzle, nil
}

func (r *puzzleRepository) FindByFilters(difficulty, decade, region string, limit, offset int) ([]models.Puzzle, error) {
	var puzzles []models.Puzzle
	query := r.db.Model(&models.Puzzle{})

	if difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}
	if decade != "" {
		query = query.Where("decade = ?", decade)
	}
	if region != "" {
		query = query.Where("region = ?", region)
	}

	err := query.Limit(limit).Offset(offset).Find(&puzzles).Error
	return puzzles, err
}

func (r *puzzleRepository) Update(puzzle *models.Puzzle) error {
	return r.db.Save(puzzle).Error
}

func (r *puzzleRepository) Delete(id uint) error {
	return r.db.Delete(&models.Puzzle{}, id).Error
}

func (r *puzzleRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Puzzle{}).Count(&count).Error
	return count, err
}
