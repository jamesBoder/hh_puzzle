package repository

import (
"errors"

"gorm.io/gorm"
"hh_puzzle/internal/models"
)

// AttemptRepository defines methods for puzzle attempt data access
type AttemptRepository interface {
Create(attempt *models.PuzzleAttempt) error
FindByID(id uint) (*models.PuzzleAttempt, error)
FindByUserAndPuzzle(userID, puzzleID uint) (*models.PuzzleAttempt, error)
FindByUser(userID uint) ([]models.PuzzleAttempt, error)
Update(attempt *models.PuzzleAttempt) error
GetUserCompletedCount(userID uint) (int64, error)
}

type attemptRepository struct {
db *gorm.DB
}

// NewAttemptRepository creates a new attempt repository
func NewAttemptRepository(db *gorm.DB) AttemptRepository {
return &attemptRepository{db: db}
}

func (r *attemptRepository) Create(attempt *models.PuzzleAttempt) error {
return r.db.Create(attempt).Error
}

func (r *attemptRepository) FindByID(id uint) (*models.PuzzleAttempt, error) {
var attempt models.PuzzleAttempt
err := r.db.Preload("Puzzle").First(&attempt, id).Error
if err != nil {
if errors.Is(err, gorm.ErrRecordNotFound) {
return nil, errors.New("attempt not found")
}
return nil, err
}
return &attempt, nil
}

func (r *attemptRepository) FindByUserAndPuzzle(userID, puzzleID uint) (*models.PuzzleAttempt, error) {
	var attempt models.PuzzleAttempt
	err := r.db.Where("user_id = ? AND puzzle_id = ?", userID, puzzleID).First(&attempt).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("attempt not found")
		}
		return nil, err
	}
	return &attempt, nil
}

func (r *attemptRepository) FindByUser(userID uint) ([]models.PuzzleAttempt, error) {
var attempts []models.PuzzleAttempt
err := r.db.Where("user_id = ?", userID).Preload("Puzzle").Find(&attempts).Error
return attempts, err
}

func (r *attemptRepository) Update(attempt *models.PuzzleAttempt) error {
return r.db.Save(attempt).Error
}

func (r *attemptRepository) GetUserCompletedCount(userID uint) (int64, error) {
var count int64
err := r.db.Model(&models.PuzzleAttempt{}).Where("user_id = ? AND is_completed = ?", userID, true).Count(&count).Error
return count, err
}