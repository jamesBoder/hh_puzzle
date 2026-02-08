package handlers

import (
	"github.com/gin-gonic/gin"
)

// SuccessResponse represents a successful API response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Message string      `json:"message,omitempty"`
}

// ErrorResponse represents an error API response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
}

// PaginatedResponse represents a paginated API response
type PaginatedResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Meta    Pagination  `json:"meta"`
}

// Pagination contains pagination metadata
type Pagination struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// RespondSuccess sends a success response (200 OK)
func RespondSuccess(c *gin.Context, data interface{}, message string) {
	c.JSON(200, SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// RespondCreated sends a created response (201 Created)
func RespondCreated(c *gin.Context, data interface{}, message string) {
	c.JSON(201, SuccessResponse{
		Success: true,
		Data:    data,
		Message: message,
	})
}

// RespondError sends an error response
func RespondError(c *gin.Context, statusCode int, message string, code string) {
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Error:   message,
		Code:    code,
	})
}

// RespondBadRequest sends a 400 Bad Request response
func RespondBadRequest(c *gin.Context, message string) {
	RespondError(c, 400, message, "BAD_REQUEST")
}

// RespondUnauthorized sends a 401 Unauthorized response
func RespondUnauthorized(c *gin.Context, message string) {
	RespondError(c, 401, message, "UNAUTHORIZED")
}

// RespondForbidden sends a 403 Forbidden response
func RespondForbidden(c *gin.Context, message string) {
	RespondError(c, 403, message, "FORBIDDEN")
}

// RespondNotFound sends a 404 Not Found response
func RespondNotFound(c *gin.Context, message string) {
	RespondError(c, 404, message, "NOT_FOUND")
}

// RespondInternalError sends a 500 Internal Server Error response
func RespondInternalError(c *gin.Context, message string) {
	RespondError(c, 500, message, "INTERNAL_ERROR")
}

// RespondPaginated sends a paginated response
func RespondPaginated(c *gin.Context, data interface{}, pagination Pagination) {
	c.JSON(200, PaginatedResponse{
		Success: true,
		Data:    data,
		Meta:    pagination,
	})
}
