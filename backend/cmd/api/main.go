package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"time"

	"hh_puzzle/internal/config"
	"hh_puzzle/internal/crossword"
	"hh_puzzle/internal/database"
	"hh_puzzle/internal/handlers"
	"hh_puzzle/internal/repository"
	"hh_puzzle/internal/routes"
	"hh_puzzle/internal/services"
)

func main() {
	log.Println("🚀 Starting HH_Puzzle API Server...")

	// Seed random number generator
	rand.Seed(time.Now().UnixNano())

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

	// Run auto-migration to ensure all tables exist
	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("❌ Failed to auto-migrate: %v", err)
	}
	log.Println("✅ Database schema up to date")

	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	puzzleRepo := repository.NewPuzzleRepository(database.DB)
	attemptRepo := repository.NewAttemptRepository(database.DB)
	log.Println("✅ Repositories initialized")

	// Seed puzzles if the database is empty
	seedPuzzlesIfEmpty(puzzleRepo)

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

// seedPuzzlesIfEmpty generates puzzles from word lists when the database is empty.
// This runs automatically on every server start so you never need to run
// generate_puzzles manually.
func seedPuzzlesIfEmpty(puzzleRepo repository.PuzzleRepository) {
	count, err := puzzleRepo.Count()
	if err != nil {
		log.Printf("⚠️  Could not check puzzle count: %v", err)
		return
	}
	if count > 0 {
		log.Printf("✅ Database already has %d puzzles — skipping seed", count)
		return
	}

	log.Println("🌱 No puzzles found — seeding database from word lists...")

	wordFiles, err := filepath.Glob("data/words/*.json")
	if err != nil || len(wordFiles) == 0 {
		log.Println("⚠️  No word list files found in data/words/ — skipping seed")
		return
	}

	generator := crossword.NewHipHopGenerator(15) // 15×15 grid for faster generation
	total := 0

	for _, wordFile := range wordFiles {
		words := loadWordFile(wordFile)
		if len(words) == 0 {
			continue
		}

		// Filter words that fit the grid
		filtered := filterWords(words, 15)
		if len(filtered) < 5 {
			continue
		}

		// Determine difficulty from word distribution
		difficulty := guessDifficulty(filtered)

		// Generate 2 puzzles per word file to keep startup fast
		for i := 0; i < 2; i++ {
			shuffled := make([]crossword.HipHopWord, len(filtered))
			copy(shuffled, filtered)
			rand.Shuffle(len(shuffled), func(a, b int) {
				shuffled[a], shuffled[b] = shuffled[b], shuffled[a]
			})

			puzzle, genErr := generator.GeneratePuzzle(shuffled, difficulty, 50)
			if genErr != nil {
				log.Printf("   ⚠️  Could not generate puzzle from %s: %v", filepath.Base(wordFile), genErr)
				continue
			}

			if createErr := puzzleRepo.Create(puzzle); createErr != nil {
				log.Printf("   ⚠️  Could not save puzzle: %v", createErr)
				continue
			}

			total++
			log.Printf("   ✓ Seeded puzzle #%d: %s", total, puzzle.Title)
		}
	}

	if total > 0 {
		log.Printf("🎉 Seeded %d puzzles successfully", total)
	} else {
		log.Println("⚠️  Seed completed but no puzzles were created — check word list files")
	}
}

func loadWordFile(path string) []crossword.HipHopWord {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var words []crossword.HipHopWord
	if err := json.Unmarshal(data, &words); err != nil {
		return nil
	}
	return words
}

func filterWords(words []crossword.HipHopWord, maxLen int) []crossword.HipHopWord {
	out := make([]crossword.HipHopWord, 0, len(words))
	for _, w := range words {
		if len(w.Answer) > 0 && len(w.Answer) <= maxLen {
			out = append(out, w)
		}
	}
	return out
}

func guessDifficulty(words []crossword.HipHopWord) string {
	// Use a simple heuristic: average word length
	total := 0
	for _, w := range words {
		total += len(w.Answer)
	}
	avg := total / len(words)
	switch {
	case avg <= 5:
		return "beginner"
	case avg <= 8:
		return "intermediate"
	default:
		return "expert"
	}
}
