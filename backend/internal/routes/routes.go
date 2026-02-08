package routes

import (
	"github.com/gin-gonic/gin"
	"hh_puzzle/internal/handlers"
	"hh_puzzle/internal/middleware"
)

// SetupRoutes configures all API routes
func SetupRoutes(
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	puzzleHandler *handlers.PuzzleHandler,
	attemptHandler *handlers.AttemptHandler,
) *gin.Engine {
	// Create Gin router with default middleware (logger and recovery)
	r := gin.Default()

	// Add custom middleware
	r.Use(middleware.CORSMiddleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"success": true,
			"data": gin.H{
				"status": "ok",
			},
		})
	})

	// Public routes - Authentication
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/guest", authHandler.CreateGuest)
	}

	// Protected routes - Require authentication
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// Auth routes
		api.GET("/auth/me", authHandler.GetCurrentUser)

		// User routes
		users := api.Group("/users")
		{
			users.GET("/profile", userHandler.GetProfile)
			users.PUT("/profile", userHandler.UpdateProfile)
			users.PUT("/preferences", userHandler.UpdatePreferences)
			users.GET("/stats", userHandler.GetStats)
			users.DELETE("/account", userHandler.DeleteAccount)
		}

		// Puzzle routes
		puzzles := api.Group("/puzzles")
		{
			puzzles.GET("", puzzleHandler.GetPuzzles)
			puzzles.GET("/:id", puzzleHandler.GetPuzzleByID)
			puzzles.GET("/daily", puzzleHandler.GetDailyChallenge)
		}

		// Puzzle pack routes
		packs := api.Group("/puzzle-packs")
		{
			packs.GET("", puzzleHandler.GetPuzzlePacks)
			packs.GET("/:id", puzzleHandler.GetPuzzlePackByID)
		}

		// Attempt routes
		attempts := api.Group("/attempts")
		{
			attempts.POST("/start", attemptHandler.StartAttempt)
			attempts.GET("", attemptHandler.GetAttempts)
			attempts.GET("/:id", attemptHandler.GetAttemptByID)
			attempts.PUT("/:id/progress", attemptHandler.UpdateProgress)
			attempts.POST("/:id/submit", attemptHandler.SubmitAttempt)
		}
	}

	return r
}
