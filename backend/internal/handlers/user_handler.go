package handlers

import (
	"github.com/gin-gonic/gin"
	"hh_puzzle/internal/middleware"
	"hh_puzzle/internal/services"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userService services.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// UpdateProfileRequest represents the profile update request
type UpdateProfileRequest struct {
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
}

// UpdatePreferencesRequest represents the preferences update request
type UpdatePreferencesRequest struct {
	MusicEnabled bool   `json:"music_enabled"`
	MusicVolume  int    `json:"music_volume"`
	Theme        string `json:"theme"`
	Difficulty   string `json:"difficulty"`
}

// GetProfile returns the user's profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	profile, err := h.userService.GetProfile(claims.UserID)
	if err != nil {
		RespondNotFound(c, err.Error())
		return
	}

	RespondSuccess(c, profile, "")
}

// UpdateProfile updates the user's profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	if err := h.userService.UpdateProfile(claims.UserID, req.DisplayName, req.AvatarURL); err != nil {
		RespondBadRequest(c, err.Error())
		return
	}

	RespondSuccess(c, nil, "Profile updated successfully")
}

// UpdatePreferences updates the user's preferences
func (h *UserHandler) UpdatePreferences(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	var req UpdatePreferencesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	if err := h.userService.UpdatePreferences(
		claims.UserID,
		req.MusicEnabled,
		req.MusicVolume,
		req.Theme,
		req.Difficulty,
	); err != nil {
		RespondBadRequest(c, err.Error())
		return
	}

	RespondSuccess(c, nil, "Preferences updated successfully")
}

// GetStats returns the user's statistics
func (h *UserHandler) GetStats(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	stats, err := h.userService.GetUserStats(claims.UserID)
	if err != nil {
		RespondInternalError(c, err.Error())
		return
	}

	RespondSuccess(c, stats, "")
}

// DeleteAccount deletes the user's account
func (h *UserHandler) DeleteAccount(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	if err := h.userService.DeleteAccount(claims.UserID); err != nil {
		RespondInternalError(c, err.Error())
		return
	}

	RespondSuccess(c, nil, "Account deleted successfully")
}
