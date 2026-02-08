package services

import (
	"errors"
	"math"
	"time"

	"hh_puzzle/internal/models"
	"hh_puzzle/internal/repository"
)

// PuzzleFilters contains filter parameters for puzzle queries
type PuzzleFilters struct {
	Difficulty string
	Decade     string
	Region     string
	Subgenre   string
	PackID     *uint
	Page       int
	PerPage    int
}

// Pagination contains pagination metadata
type Pagination struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// PuzzleService handles puzzle-related business logic
type PuzzleService interface {
	GetPuzzleByID(puzzleID uint) (*models.Puzzle, error)
	GetDailyChallenge() (*models.Puzzle, error)
	GetPuzzlesByFilters(filters PuzzleFilters) ([]models.Puzzle, *Pagination, error)
	GetPuzzlePack(packID uint) (*models.PuzzlePack, error)
	GetAvailablePacks() ([]models.PuzzlePack, error)
}

type puzzleService struct {
	puzzleRepo repository.PuzzleRepository
}

// NewPuzzleService creates a new puzzle service
func NewPuzzleService(puzzleRepo repository.PuzzleRepository) PuzzleService {
	return &puzzleService{
		puzzleRepo: puzzleRepo,
	}
}

func (s *puzzleService) GetPuzzleByID(puzzleID uint) (*models.Puzzle, error) {
	return s.puzzleRepo.FindByID(puzzleID)
}

func (s *puzzleService) GetDailyChallenge() (*models.Puzzle, error) {
	today := time.Now().Truncate(24 * time.Hour)
	return s.puzzleRepo.FindDailyChallenge(today)
}

func (s *puzzleService) GetPuzzlesByFilters(filters PuzzleFilters) ([]models.Puzzle, *Pagination, error) {
	// Set default pagination
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PerPage < 1 || filters.PerPage > 100 {
		filters.PerPage = 20
	}

	// Calculate offset
	offset := (filters.Page - 1) * filters.PerPage

	// Get puzzles
	puzzles, err := s.puzzleRepo.FindByFilters(
		filters.Difficulty,
		filters.Decade,
		filters.Region,
		filters.PerPage,
		offset,
	)
	if err != nil {
		return nil, nil, err
	}

	// Get total count
	total, err := s.puzzleRepo.Count()
	if err != nil {
		return nil, nil, err
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(filters.PerPage)))

	pagination := &Pagination{
		Page:       filters.Page,
		PerPage:    filters.PerPage,
		Total:      total,
		TotalPages: totalPages,
	}

	return puzzles, pagination, nil
}

func (s *puzzleService) GetPuzzlePack(packID uint) (*models.PuzzlePack, error) {
	// Note: This would need a PuzzlePackRepository method
	// For now, return error
	return nil, errors.New("not implemented")
}

func (s *puzzleService) GetAvailablePacks() ([]models.PuzzlePack, error) {
	// Note: This would need a PuzzlePackRepository method
	// For now, return error
	return nil, errors.New("not implemented")
}
