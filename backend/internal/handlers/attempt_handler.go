package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"hh_puzzle/internal/middleware"
	"hh_puzzle/internal/services"
)

// AttemptHandler handles puzzle attempt HTTP requests
type AttemptHandler struct {
	attemptService services.AttemptService
}

// NewAttemptHandler creates a new attempt handler
func NewAttemptHandler(attemptService services.AttemptService) *AttemptHandler {
	return &AttemptHandler{
		attemptService: attemptService,
	}
}

// StartAttemptRequest represents the start attempt request
type StartAttemptRequest struct {
	PuzzleID uint `json:"puzzle_id" binding:"required"`
}

// UpdateProgressRequest represents the update progress request
type UpdateProgressRequest struct {
	CurrentState map[string]interface{} `json:"current_state"`
}

// SubmitAttemptRequest represents the submit attempt request
type SubmitAttemptRequest struct {
	CompletionTime int `json:"completion_time" binding:"required"`
	HintsUsed      int `json:"hints_used"`
}

// StartAttempt starts a new puzzle attempt
func (h *AttemptHandler) StartAttempt(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	var req StartAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	attempt, err := h.attemptService.StartAttempt(claims.UserID, req.PuzzleID)
	if err != nil {
		RespondBadRequest(c, err.Error())
		return
	}

	RespondCreated(c, attempt, "Attempt started successfully")
}

// UpdateProgress updates the progress of an attempt
func (h *AttemptHandler) UpdateProgress(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondBadRequest(c, "Invalid attempt ID")
		return
	}

	var req UpdateProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	if err := h.attemptService.UpdateProgress(uint(id), req.CurrentState); err != nil {
		RespondBadRequest(c, err.Error())
		return
	}

	RespondSuccess(c, nil, "Progress updated successfully")
}

// SubmitAttempt submits a completed attempt
func (h *AttemptHandler) SubmitAttempt(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondBadRequest(c, "Invalid attempt ID")
		return
	}

	var req SubmitAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		RespondBadRequest(c, "Invalid request body")
		return
	}

	result, err := h.attemptService.SubmitAttempt(uint(id), req.CompletionTime, req.HintsUsed)
	if err != nil {
		RespondBadRequest(c, err.Error())
		return
	}

	RespondSuccess(c, result, "Attempt submitted successfully")
}

// GetAttempts returns all attempts for the current user
func (h *AttemptHandler) GetAttempts(c *gin.Context) {
	claims, ok := middleware.GetUserFromContext(c)
	if !ok {
		RespondUnauthorized(c, "User not found in context")
		return
	}

	attempts, err := h.attemptService.GetUserAttempts(claims.UserID)
	if err != nil {
		RespondInternalError(c, err.Error())
		return
	}

	RespondSuccess(c, attempts, "")
}

// GetAttemptByID returns a single attempt by ID
func (h *AttemptHandler) GetAttemptByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondBadRequest(c, "Invalid attempt ID")
		return
	}

	attempt, err := h.attemptService.GetAttemptByID(uint(id))
	if err != nil {
		RespondNotFound(c, "Attempt not found")
		return
	}

	RespondSuccess(c, attempt, "")
}
