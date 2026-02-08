package middleware

import (
	"log"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware recovers from panics and returns 500 error
// Note: Gin's Default() already includes recovery, but this is a custom one
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Log the error and stack trace
				log.Printf("PANIC: %v\n%s", err, debug.Stack())

				// Return 500 error
				c.JSON(500, gin.H{
					"success": false,
					"error":   "Internal server error",
					"code":    "INTERNAL_ERROR",
				})
				c.Abort()
			}
		}()

		c.Next()
	}
}
