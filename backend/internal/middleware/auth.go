package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"hh_puzzle/internal/utils"
)

const UserContextKey = "user"

// AuthMiddleware validates JWT tokens and protects routes
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{
				"success": false,
				"error":   "Missing authorization header",
				"code":    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		// Check Bearer token format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(401, gin.H{
				"success": false,
				"error":   "Invalid authorization header format",
				"code":    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Validate token
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(401, gin.H{
				"success": false,
				"error":   "Invalid or expired token",
				"code":    "UNAUTHORIZED",
			})
			c.Abort()
			return
		}

		// Add claims to context
		c.Set(UserContextKey, claims)
		c.Next()
	}
}

// GetUserFromContext extracts user claims from context
func GetUserFromContext(c *gin.Context) (*utils.Claims, bool) {
	claims, exists := c.Get(UserContextKey)
	if !exists {
		return nil, false
	}
	userClaims, ok := claims.(*utils.Claims)
	return userClaims, ok
}
