package main

import (
	"log"

	"hh_puzzle/internal/config"
	"hh_puzzle/internal/database"
	"hh_puzzle/internal/handlers"
	"hh_puzzle/internal/repository"
	"hh_puzzle/internal/routes"
	"hh_puzzle/internal/services"
)

func main() {
	log.Println("🚀 Starting HH_Puzzle API Server...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()
	log.Println("✅ Database connected")

	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	puzzleRepo := repository.NewPuzzleRepository(database.DB)
	attemptRepo := repository.NewAttemptRepository(database.DB)
	log.Println("✅ Repositories initialized")

	// Initialize services
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	puzzleService := services.NewPuzzleService(puzzleRepo)
	attemptService := services.NewAttemptService(attemptRepo, userRepo, puzzleRepo)
	log.Println("✅ Services initialized")

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, userService)
	userHandler := handlers.NewUserHandler(userService)
	puzzleHandler := handlers.NewPuzzleHandler(puzzleService)
	attemptHandler := handlers.NewAttemptHandler(attemptService)
	log.Println("✅ Handlers initialized")

	// Setup routes
	router := routes.SetupRoutes(
		authHandler,
		userHandler,
		puzzleHandler,
		attemptHandler,
	)
	log.Println("✅ Routes configured")

	// Start server
	port := cfg.Server.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("🌐 Server starting on port %s", port)
	log.Printf("📍 API available at http://localhost:%s/api", port)
	log.Printf("💚 Health check at http://localhost:%s/health", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}
