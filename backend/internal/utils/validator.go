package utils

import (
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// ValidateEmail checks if an email is valid
func ValidateEmail(email string) bool {
	return emailRegex.MatchString(email)
}

// ValidatePassword checks if a password meets minimum requirements
func ValidatePassword(password string) bool {
	// Minimum 8 characters
	return len(password) >= 8
}

// ValidateUsername checks if a username is valid
func ValidateUsername(username string) bool {
	// 3-50 characters, alphanumeric and underscores only
	if len(username) < 3 || len(username) > 50 {
		return false
	}
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return usernameRegex.MatchString(username)
}

// SanitizeString removes leading/trailing whitespace
func SanitizeString(s string) string {
	return strings.TrimSpace(s)
}

// SanitizeEmail removes whitespace and converts to lowercase for case-insensitive comparison
func SanitizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
