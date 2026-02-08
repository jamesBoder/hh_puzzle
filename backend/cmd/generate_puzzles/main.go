package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"hh_puzzle/internal/config"
	"hh_puzzle/internal/crossword"
	"hh_puzzle/internal/database"
)

func main() {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	err = database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("🎵 HH_Puzzle - Bulk Puzzle Generator")
	fmt.Println("=====================================\n")

	generator := crossword.NewHipHopGenerator(20) // Using 20x20 grid for more complex puzzles

	// Find all JSON files in data/words directory
	wordFiles, err := filepath.Glob("data/words/*.json")
	if err != nil {
		log.Fatalf("Failed to find word files: %v", err)
	}

	if len(wordFiles) == 0 {
		log.Fatal("No word list files found in data/words/")
	}

	fmt.Printf("Found %d word list file(s)\n\n", len(wordFiles))

	totalGenerated := 0

	// Process each word list file
	for _, wordFile := range wordFiles {
		filename := filepath.Base(wordFile)
		fmt.Printf("📝 Processing: %s\n", filename)

		words := loadWords(wordFile)
		if len(words) == 0 {
			fmt.Printf("   ⚠️  No words found, skipping...\n\n")
			continue
		}

		fmt.Printf("   Loaded %d words\n", len(words))

		// Determine difficulty based on word count or metadata
		// You can customize this logic
		difficulty := determineDifficulty(words, filename)
		fmt.Printf("   Difficulty: %s\n", difficulty)

		// Generate puzzles from this word list
		// Adjust the number based on how many words you have
		puzzlesToGenerate := calculatePuzzleCount(len(words))
		fmt.Printf("   Generating %d puzzles...\n", puzzlesToGenerate)

		successCount := 0
		for i := 0; i < puzzlesToGenerate; i++ {
			puzzle, err := generator.GeneratePuzzle(words, difficulty, 50)
			if err != nil {
				fmt.Printf("   ✗ Error generating puzzle %d: %v\n", i+1, err)
				continue
			}

			// Save to database
			result := database.DB.Create(puzzle)
			if result.Error != nil {
				fmt.Printf("   ✗ Error saving puzzle %d: %v\n", i+1, result.Error)
				continue
			}

			successCount++
			totalGenerated++
			fmt.Printf("   ✓ Created puzzle %d/%d: %s\n", successCount, puzzlesToGenerate, puzzle.Title)
		}

		fmt.Printf("   ✅ Generated %d/%d puzzles from %s\n\n", successCount, puzzlesToGenerate, filename)
	}

	fmt.Printf("🎉 Complete! Generated %d total puzzles from %d word lists\n", totalGenerated, len(wordFiles))
}

func loadWords(path string) []crossword.HipHopWord {
	data, err := os.ReadFile(path)
	if err != nil {
		fmt.Printf("⚠️  Could not read file %s: %v\n", path, err)
		return []crossword.HipHopWord{}
	}

	var words []crossword.HipHopWord
	err = json.Unmarshal(data, &words)
	if err != nil {
		fmt.Printf("⚠️  Could not parse JSON from %s: %v\n", path, err)
		return []crossword.HipHopWord{}
	}

	return words
}

// determineDifficulty analyzes the word list to determine difficulty
func determineDifficulty(words []crossword.HipHopWord, filename string) string {
	// Check filename for difficulty hints
	lowerFilename := strings.ToLower(filename)
	
	if strings.Contains(lowerFilename, "beginner") || strings.Contains(lowerFilename, "easy") {
		return "beginner"
	}
	if strings.Contains(lowerFilename, "expert") || strings.Contains(lowerFilename, "hard") {
		return "expert"
	}
	if strings.Contains(lowerFilename, "intermediate") || strings.Contains(lowerFilename, "medium") {
		return "intermediate"
	}

	// Check if words have difficulty metadata
	if len(words) > 0 {
		// Count how many words have each category
		beginnerCount := 0
		expertCount := 0
		
		for _, word := range words {
			category := strings.ToLower(word.Category)
			if strings.Contains(category, "beginner") || strings.Contains(category, "mainstream") {
				beginnerCount++
			} else if strings.Contains(category, "expert") || strings.Contains(category, "deep") {
				expertCount++
			}
		}
		
		// Determine based on majority
		if beginnerCount > len(words)/2 {
			return "beginner"
		}
		if expertCount > len(words)/2 {
			return "expert"
		}
	}

	// Default to intermediate
	return "intermediate"
}

// calculatePuzzleCount determines how many puzzles to generate based on word count
func calculatePuzzleCount(wordCount int) int {
	// Generate more puzzles if we have more words
	switch {
	case wordCount >= 50:
		return 15 // Generate 15 puzzles from large word lists
	case wordCount >= 30:
		return 10  // Generate 10 puzzles from medium word lists
	case wordCount >= 15:
		return 5  // Generate 5 puzzles from small word lists
	default:
		return 3  // Generate 3 puzzles from very small word lists
	}
}
