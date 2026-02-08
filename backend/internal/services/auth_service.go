package services

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"hh_puzzle/internal/models"
	"hh_puzzle/internal/repository"
	"hh_puzzle/internal/utils"
)

// AuthService handles authentication business logic
type AuthService interface {
	Register(email, username, password string) (*models.User, string, error)
	Login(email, password string) (*models.User, string, error)
	CreateGuestUser() (*models.User, string, error)
	ValidateToken(token string) (*utils.Claims, error)
}

type authService struct {
	userRepo repository.UserRepository
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{
		userRepo: userRepo,
	}
}

func (s *authService) Register(email, username, password string) (*models.User, string, error) {
	// Validate input
	email = utils.SanitizeString(email)
	username = utils.SanitizeString(username)

	if !utils.ValidateEmail(email) {
		return nil, "", errors.New("invalid email format")
	}

	if !utils.ValidateUsername(username) {
		return nil, "", errors.New("username must be 3-50 characters, alphanumeric and underscores only")
	}

	if !utils.ValidatePassword(password) {
		return nil, "", errors.New("password must be at least 8 characters")
	}

	// Check if email already exists
	existingUser, _ := s.userRepo.FindByEmail(email)
	if existingUser != nil {
		return nil, "", errors.New("email already registered")
	}

	// Check if username already exists
	existingUser, _ = s.userRepo.FindByUsername(username)
	if existingUser != nil {
		return nil, "", errors.New("username already taken")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &models.User{
		Email:        email,
		Username:     username,
		PasswordHash: hashedPassword,
		IsGuest:      false,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, "", fmt.Errorf("failed to create user: %w", err)
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.IsGuest)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

func (s *authService) Login(email, password string) (*models.User, string, error) {
	// Sanitize input
	email = utils.SanitizeString(email)

	// Find user by email
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPassword(password, user.PasswordHash) {
		return nil, "", errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.IsGuest)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

func (s *authService) CreateGuestUser() (*models.User, string, error) {
	// Generate unique guest username
	rand.Seed(time.Now().UnixNano())
	username := fmt.Sprintf("guest_%d", rand.Intn(1000000))

	// Ensure username is unique
	for {
		existingUser, _ := s.userRepo.FindByUsername(username)
		if existingUser == nil {
			break
		}
		username = fmt.Sprintf("guest_%d", rand.Intn(1000000))
	}

	// Create guest user (no email or password)
	user := &models.User{
		Email:    fmt.Sprintf("%s@guest.local", username),
		Username: username,
		IsGuest:  true,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, "", fmt.Errorf("failed to create guest user: %w", err)
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.IsGuest)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

func (s *authService) ValidateToken(token string) (*utils.Claims, error) {
	return utils.ValidateToken(token)
}
