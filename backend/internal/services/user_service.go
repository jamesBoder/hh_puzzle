package services

import (
	"errors"

	"hh_puzzle/internal/models"
	"hh_puzzle/internal/repository"
)

// UserStats represents aggregated user statistics
type UserStats struct {
	TotalPoints      int `json:"total_points"`
	PuzzlesCompleted int `json:"puzzles_completed"`
	CurrentStreak    int `json:"current_streak"`
	LongestStreak    int `json:"longest_streak"`
}

// UserService handles user-related business logic
type UserService interface {
	GetProfile(userID uint) (*models.UserProfile, error)
	UpdateProfile(userID uint, displayName, avatarURL string) error
	UpdatePreferences(userID uint, musicEnabled bool, musicVolume int, theme, difficulty string) error
	GetUserStats(userID uint) (*UserStats, error)
	DeleteAccount(userID uint) error
}

type userService struct {
	userRepo repository.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

func (s *userService) GetProfile(userID uint) (*models.UserProfile, error) {
	user, err := s.userRepo.GetWithProfile(userID)
	if err != nil {
		return nil, err
	}

	if user.Profile == nil {
		return nil, errors.New("profile not found")
	}

	return user.Profile, nil
}

func (s *userService) UpdateProfile(userID uint, displayName, avatarURL string) error {
	user, err := s.userRepo.GetWithProfile(userID)
	if err != nil {
		return err
	}

	if user.Profile == nil {
		return errors.New("profile not found")
	}

	// Update profile fields
	if displayName != "" {
		user.Profile.DisplayName = displayName
	}
	if avatarURL != "" {
		user.Profile.AvatarURL = avatarURL
	}

	return s.userRepo.Update(user)
}

func (s *userService) UpdatePreferences(userID uint, musicEnabled bool, musicVolume int, theme, difficulty string) error {
	user, err := s.userRepo.GetWithProfile(userID)
	if err != nil {
		return err
	}

	if user.Profile == nil {
		return errors.New("profile not found")
	}

	// Validate music volume
	if musicVolume < 0 || musicVolume > 100 {
		return errors.New("music volume must be between 0 and 100")
	}

	// Validate theme
	if theme != "" && theme != "dark" && theme != "light" {
		return errors.New("theme must be 'dark' or 'light'")
	}

	// Validate difficulty
	if difficulty != "" && difficulty != "beginner" && difficulty != "intermediate" && difficulty != "expert" {
		return errors.New("difficulty must be 'beginner', 'intermediate', or 'expert'")
	}

	// Update preferences
	user.Profile.MusicEnabled = musicEnabled
	user.Profile.MusicVolume = musicVolume
	if theme != "" {
		user.Profile.Theme = theme
	}
	if difficulty != "" {
		user.Profile.DifficultyPreference = difficulty
	}

	return s.userRepo.Update(user)
}

func (s *userService) GetUserStats(userID uint) (*UserStats, error) {
	user, err := s.userRepo.GetWithProfile(userID)
	if err != nil {
		return nil, err
	}

	if user.Profile == nil {
		return nil, errors.New("profile not found")
	}

	stats := &UserStats{
		TotalPoints:      user.Profile.TotalPoints,
		PuzzlesCompleted: user.Profile.PuzzlesCompleted,
		CurrentStreak:    user.Profile.CurrentStreak,
		LongestStreak:    user.Profile.LongestStreak,
	}

	return stats, nil
}

func (s *userService) DeleteAccount(userID uint) error {
	return s.userRepo.Delete(userID)
}
