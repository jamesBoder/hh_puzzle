package handlers

import (
	"github.com/gin-gonic/gin"
	"hh_puzzle/internal/middleware"
	"hh_puzzle/internal/services"
)

// AuthHandler handles authentication HTTP requests
type AuthHandler struct {
	authService services.AuthService
	userService services.UserService
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(authService services.AuthService, userService services.UserService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userService: userService,
	}
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Email    string `json:"email" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	User  interface{} `json:"user"`
	Token string      `json:"token"`
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	user, token, err := h.authService.Register(req.Email, req.Username, req.Password)
	if err != nil {
		RespondBadRequest(c, err.Error())
		return
	}

	RespondCreated(c, AuthResponse{
		User:  user,
		Token: token,
	}, "User registered successfully")
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	user, token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		RespondUnauthorized(c, err.Error())
		return
	}

	RespondSuccess(c, AuthResponse{
		User:  user,
		Token: token,
	}, "Login successful")
}

// CreateGuest handles guest user creation
func (h *AuthHandler) CreateGuest(c *gin.Context) {
	user, token, err := h.authService.CreateGuestUser()
	if err != nil {
		RespondInternalError(c, err.Error())
		return
	}

	RespondCreated(c, AuthResponse{
		User:  user,
		Token: token,
	}, "Guest user created successfully")
}

// GetCurrentUser returns the current authenticated user
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	profile, err := h.userService.GetProfile(claims.UserID)
	if err != nil {
		RespondNotFound(c, "User profile not found")
		return
	}

	RespondSuccess(c, gin.H{
		"user_id":  claims.UserID,
		"email":    claims.Email,
		"is_guest": claims.IsGuest,
		"profile":  profile,
	}, "")
}
