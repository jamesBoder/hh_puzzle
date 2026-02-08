package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggerMiddleware logs HTTP requests
// Note: Gin's Default() already includes a logger, but this is a custom one
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Process request
		c.Next()

		// Log request details
		duration := time.Since(start)
		statusCode := c.Writer.Status()
		
		log.Printf(
			"[%s] %s %s - %d (%v)",
			time.Now().Format("2006-01-02 15:04:05"),
			c.Request.Method,
			c.Request.URL.Path,
			statusCode,
			duration,
		)
	}
}
