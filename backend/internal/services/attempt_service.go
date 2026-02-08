package services

import (
	"errors"
	"fmt"
	"time"

	"hh_puzzle/internal/models"
	"hh_puzzle/internal/repository"
)

// AttemptResult contains the result of a puzzle attempt submission
type AttemptResult struct {
	IsCompleted        bool    `json:"is_completed"`
	PointsEarned       int     `json:"points_earned"`
	AccuracyPercentage float64 `json:"accuracy_percentage"`
	TimeBonus          int     `json:"time_bonus"`
	NewStreak          int     `json:"new_streak"`
}

// AttemptService handles puzzle attempt business logic
type AttemptService interface {
	StartAttempt(userID, puzzleID uint) (*models.PuzzleAttempt, error)
	UpdateProgress(attemptID uint, currentState map[string]interface{}) error
	SubmitAttempt(attemptID uint, completionTime, hintsUsed int) (*AttemptResult, error)
	GetUserAttempts(userID uint) ([]models.PuzzleAttempt, error)
	GetAttemptByID(attemptID uint) (*models.PuzzleAttempt, error)
}

type attemptService struct {
	attemptRepo repository.AttemptRepository
	userRepo    repository.UserRepository
	puzzleRepo  repository.PuzzleRepository
}

// NewAttemptService creates a new attempt service
func NewAttemptService(
	attemptRepo repository.AttemptRepository,
	userRepo repository.UserRepository,
	puzzleRepo repository.PuzzleRepository,
) AttemptService {
	return &attemptService{
		attemptRepo: attemptRepo,
		userRepo:    userRepo,
		puzzleRepo:  puzzleRepo,
	}
}

func (s *attemptService) StartAttempt(userID, puzzleID uint) (*models.PuzzleAttempt, error) {
	// Check if puzzle exists
	puzzle, err := s.puzzleRepo.FindByID(puzzleID)
	if err != nil {
		return nil, errors.New("puzzle not found")
	}

	// Check if attempt already exists
	existingAttempt, err := s.attemptRepo.FindByUserAndPuzzle(userID, puzzleID)
	if err != nil {
		return nil, err
	}

	// If attempt exists and not completed, return it
	if existingAttempt != nil && !existingAttempt.IsCompleted {
		return existingAttempt, nil
	}

	// If attempt exists and completed, don't allow restart
	if existingAttempt != nil && existingAttempt.IsCompleted {
		return nil, errors.New("puzzle already completed")
	}

	// Create new attempt
	attempt := &models.PuzzleAttempt{
		UserID:       userID,
		PuzzleID:     puzzleID,
		CurrentState: models.JSONB{},
		IsCompleted:  false,
		HintsUsed:    0,
		PointsEarned: 0,
		StartedAt:    time.Now(),
	}

	if err := s.attemptRepo.Create(attempt); err != nil {
		return nil, fmt.Errorf("failed to create attempt: %w", err)
	}

	// Load puzzle data
	attempt.Puzzle = *puzzle

	return attempt, nil
}

func (s *attemptService) UpdateProgress(attemptID uint, currentState map[string]interface{}) error {
	attempt, err := s.attemptRepo.FindByID(attemptID)
	if err != nil {
		return err
	}

	if attempt.IsCompleted {
		return errors.New("cannot update completed attempt")
	}

	attempt.CurrentState = currentState
	return s.attemptRepo.Update(attempt)
}

func (s *attemptService) SubmitAttempt(attemptID uint, completionTime, hintsUsed int) (*AttemptResult, error) {
	// Get attempt
	attempt, err := s.attemptRepo.FindByID(attemptID)
	if err != nil {
		return nil, err
	}

	if attempt.IsCompleted {
		return nil, errors.New("attempt already completed")
	}

	// Get puzzle
	puzzle, err := s.puzzleRepo.FindByID(attempt.PuzzleID)
	if err != nil {
		return nil, err
	}

	// Calculate accuracy (simplified - in real app, would check actual answers)
	accuracy := 100.0 - float64(hintsUsed*5) // Each hint reduces accuracy by 5%
	if accuracy < 0 {
		accuracy = 0
	}

	// Calculate points
	basePoints := puzzle.BasePoints
	timeBonus := s.calculateTimeBonus(completionTime, puzzle.EstimatedTime)
	hintsPenalty := hintsUsed * 10
	accuracyBonus := int(accuracy * 0.5)

	totalPoints := basePoints + timeBonus - hintsPenalty + accuracyBonus
	if totalPoints < 0 {
		totalPoints = 0
	}

	// Update attempt
	now := time.Now()
	attempt.IsCompleted = true
	attempt.CompletedAt = &now
	attempt.CompletionTime = &completionTime
	attempt.HintsUsed = hintsUsed
	attempt.PointsEarned = totalPoints
	attempt.AccuracyPercentage = &accuracy

	if err := s.attemptRepo.Update(attempt); err != nil {
		return nil, fmt.Errorf("failed to update attempt: %w", err)
	}

	// Update user profile
	user, err := s.userRepo.GetWithProfile(attempt.UserID)
	if err != nil {
		return nil, err
	}

	if user.Profile != nil {
		// Add points
		user.Profile.TotalPoints += totalPoints

		// Increment puzzles completed
		user.Profile.PuzzlesCompleted++

		// Update streak
		newStreak := s.updateStreak(user.Profile)

		// Update last puzzle date
		now := time.Now()
		user.Profile.LastPuzzleDate = &now

		if err := s.userRepo.Update(user); err != nil {
			return nil, fmt.Errorf("failed to update user profile: %w", err)
		}

		result := &AttemptResult{
			IsCompleted:        true,
			PointsEarned:       totalPoints,
			AccuracyPercentage: accuracy,
			TimeBonus:          timeBonus,
			NewStreak:          newStreak,
		}

		return result, nil
	}

	return nil, errors.New("user profile not found")
}

func (s *attemptService) GetUserAttempts(userID uint) ([]models.PuzzleAttempt, error) {
	return s.attemptRepo.FindByUser(userID)
}

func (s *attemptService) GetAttemptByID(attemptID uint) (*models.PuzzleAttempt, error) {
	return s.attemptRepo.FindByID(attemptID)
}

// calculateTimeBonus calculates bonus points based on completion time
func (s *attemptService) calculateTimeBonus(completionTime, estimatedTime int) int {
	if estimatedTime == 0 {
		estimatedTime = 300 // Default 5 minutes
	}

	// Bonus if completed faster than estimated time
	if completionTime < estimatedTime {
		percentFaster := float64(estimatedTime-completionTime) / float64(estimatedTime)
		bonus := int(percentFaster * 50) // Up to 50 bonus points
		return bonus
	}

	return 0
}

// updateStreak updates the user's puzzle completion streak
func (s *attemptService) updateStreak(profile *models.UserProfile) int {
	now := time.Now()

	if profile.LastPuzzleDate == nil {
		// First puzzle
		profile.CurrentStreak = 1
		profile.LongestStreak = 1
		return 1
	}

	lastDate := profile.LastPuzzleDate.Truncate(24 * time.Hour)
	today := now.Truncate(24 * time.Hour)
	yesterday := today.Add(-24 * time.Hour)

	if lastDate.Equal(yesterday) {
		// Consecutive day - increment streak
		profile.CurrentStreak++
		if profile.CurrentStreak > profile.LongestStreak {
			profile.LongestStreak = profile.CurrentStreak
		}
	} else if lastDate.Equal(today) {
		// Same day - maintain streak
		// Do nothing
	} else {
		// Streak broken - reset to 1
		profile.CurrentStreak = 1
	}

	return profile.CurrentStreak
}
