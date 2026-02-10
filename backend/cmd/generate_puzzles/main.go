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
	"hh_puzzle/internal/models"
	"hh_puzzle/internal/utils"
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

	// Step 1: Validate word lists before generation
	fmt.Println("Step 1: Validating word lists...")
	validator := utils.NewWordValidator()
	wordListDir := "data/words"
	
	validationResults, err := validator.ValidateDirectory(wordListDir)
	if err != nil {
		log.Fatalf("Failed to validate word lists: %v", err)
	}

	duplicates, err := validator.CheckCrossFileDuplicates(wordListDir)
	if err != nil {
		log.Fatalf("Failed to check duplicates: %v", err)
	}

	// Check if validation passed
	hasErrors := false
	for _, result := range validationResults {
		if !result.IsValid {
			hasErrors = true
			break
		}
	}

	if hasErrors {
		fmt.Println("\n❌ Validation failed! Please fix errors before generating puzzles.")
		utils.PrintValidationReport(validationResults, duplicates)
		os.Exit(1)
	}

	fmt.Printf("✅ Validation passed! %d word lists validated.\n\n", len(validationResults))

	// Step 2: Initialize generator and difficulty scorer
	fmt.Println("Step 2: Initializing puzzle generator...")
	generator := crossword.NewHipHopGenerator(20) // Using 20x20 grid for more complex puzzles
	difficultyScorer := crossword.NewDifficultyScorer()
	fmt.Println("✅ Generator initialized.\n")

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
	generationStats := &GenerationStats{
		FileStats: make(map[string]*FileStats),
	}

	// Step 3: Process each word list file
	fmt.Println("Step 3: Generating puzzles from word lists...")
	fmt.Println("============================================\n")
	
	for _, wordFile := range wordFiles {
		filename := filepath.Base(wordFile)
		fmt.Printf("📝 Processing: %s\n", filename)

		words := loadWords(wordFile)
		if len(words) == 0 {
			fmt.Printf("   ⚠️  No words found, skipping...\n\n")
			continue
		}

		fmt.Printf("   Loaded %d words\n", len(words))
		
		// Filter out words that are too long for the grid (max 20 characters for 20x20 grid)
		filteredWords := filterWordsByLength(words, 20)
		if len(filteredWords) < len(words) {
			fmt.Printf("   ⚠️  Filtered out %d words that were too long for the grid\n", len(words)-len(filteredWords))
		}
		
		if len(filteredWords) == 0 {
			fmt.Printf("   ⚠️  No valid words after filtering, skipping...\n\n")
			continue
		}
		
		words = filteredWords
		fmt.Printf("   Using %d valid words\n", len(words))

		// Score words for difficulty
		scoredWords := difficultyScorer.ScoreWords(words)
		distribution := crossword.GetDifficultyDistribution(scoredWords)
		
		fmt.Printf("   Difficulty distribution:\n")
		fmt.Printf("     - Beginner: %d words\n", distribution["beginner"])
		fmt.Printf("     - Intermediate: %d words\n", distribution["intermediate"])
		fmt.Printf("     - Expert: %d words\n", distribution["expert"])

		// Determine overall difficulty for this word list
		difficulty := determineDifficultyFromDistribution(distribution)
		fmt.Printf("   Overall difficulty: %s\n", difficulty)

		// Generate puzzles from this word list
		// Adjust the number based on how many words you have
		puzzlesToGenerate := calculatePuzzleCount(len(words))
		fmt.Printf("   Generating %d puzzles...\n", puzzlesToGenerate)

		successCount := 0
		failureCount := 0
		skippedCount := 0
		
		fileStats := &FileStats{
			FileName:         filename,
			TotalWords:       len(words),
			DifficultyDist:   distribution,
			TargetDifficulty: difficulty,
		}
		
		for i := 0; i < puzzlesToGenerate; i++ {
			// Use defer/recover to catch panics from the crossword library
			success := false
			func() {
				defer func() {
					if r := recover(); r != nil {
						fmt.Printf("   ✗ Panic generating puzzle %d: %v\n", i+1, r)
						failureCount++
					}
				}()
				
				puzzle, err := generator.GeneratePuzzle(words, difficulty, 50)
				if err != nil {
					fmt.Printf("   ✗ Error generating puzzle %d: %v\n", i+1, err)
					failureCount++
					return
				}

				// Check if similar puzzle already exists
				if puzzleExists(puzzle) {
					fmt.Printf("   ⊘ Skipping puzzle %d: Similar puzzle already exists\n", i+1)
					skippedCount++
					return
				}

				// Save to database
				result := database.DB.Create(puzzle)
				if result.Error != nil {
					fmt.Printf("   ✗ Error saving puzzle %d: %v\n", i+1, result.Error)
					failureCount++
					return
				}

				successCount++
				totalGenerated++
				success = true
				fmt.Printf("   ✓ Created puzzle %d/%d: %s (ID: %d)\n", successCount, puzzlesToGenerate, puzzle.Title, puzzle.ID)
			}()
			
			if success {
				fileStats.SuccessCount++
			} else {
				fileStats.FailureCount++
			}
		}

		fileStats.SuccessRate = float64(successCount) / float64(puzzlesToGenerate) * 100
		fileStats.SkippedCount = skippedCount
		generationStats.FileStats[filename] = fileStats
		generationStats.TotalGenerated += successCount
		generationStats.TotalFailed += failureCount
		generationStats.TotalSkipped += skippedCount

		if skippedCount > 0 {
			fmt.Printf("   ✅ Generated %d/%d puzzles from %s (%.1f%% success rate, %d skipped as duplicates)\n\n", 
				successCount, puzzlesToGenerate, filename, fileStats.SuccessRate, skippedCount)
		} else {
			fmt.Printf("   ✅ Generated %d/%d puzzles from %s (%.1f%% success rate)\n\n", 
				successCount, puzzlesToGenerate, filename, fileStats.SuccessRate)
		}
	}

	// Step 4: Print generation summary
	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("📊 GENERATION SUMMARY")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("\nTotal puzzles generated: %d\n", totalGenerated)
	fmt.Printf("Total skipped (duplicates): %d\n", generationStats.TotalSkipped)
	fmt.Printf("Total failures: %d\n", generationStats.TotalFailed)
	totalAttempts := totalGenerated + generationStats.TotalFailed + generationStats.TotalSkipped
	if totalAttempts > 0 {
		fmt.Printf("Overall success rate: %.1f%%\n", 
			float64(totalGenerated)/float64(totalAttempts)*100)
	}
	fmt.Printf("Word lists processed: %d\n", len(wordFiles))
	
	fmt.Println("\n💡 Next Steps:")
	fmt.Println("  1. Run 'go run cmd/analyze_puzzles/main.go' to analyze generated puzzles")
	fmt.Println("  2. Check difficulty distribution in database")
	fmt.Println("  3. Test puzzles via API endpoints")
	
	fmt.Println("\n🎉 Puzzle generation complete!")
}

// GenerationStats tracks statistics during puzzle generation
type GenerationStats struct {
	TotalGenerated int
	TotalSkipped   int
	TotalFailed    int
	FileStats      map[string]*FileStats
}

// FileStats tracks statistics for a single word list file
type FileStats struct {
	FileName         string
	TotalWords       int
	DifficultyDist   map[string]int
	TargetDifficulty string
	SuccessCount     int
	SkippedCount     int
	FailureCount     int
	SuccessRate      float64
}

// filterWordsByLength removes words that are too long for the grid
func filterWordsByLength(words []crossword.HipHopWord, maxLength int) []crossword.HipHopWord {
	filtered := make([]crossword.HipHopWord, 0, len(words))
	for _, word := range words {
		if len(word.Answer) <= maxLength {
			filtered = append(filtered, word)
		}
	}
	return filtered
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

// determineDifficultyFromDistribution determines difficulty based on word distribution
func determineDifficultyFromDistribution(distribution map[string]int) string {
	total := distribution["beginner"] + distribution["intermediate"] + distribution["expert"]
	if total == 0 {
		return "intermediate"
	}

	beginnerPct := float64(distribution["beginner"]) / float64(total) * 100
	expertPct := float64(distribution["expert"]) / float64(total) * 100

	// If majority are beginner words, mark as beginner
	if beginnerPct > 60 {
		return "beginner"
	}
	// If majority are expert words, mark as expert
	if expertPct > 40 {
		return "expert"
	}
	// Otherwise intermediate
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

// puzzleExists checks if a similar puzzle already exists in the database
func puzzleExists(puzzle *models.Puzzle) bool {
	var count int64
	
	// Check for puzzles with the same title, difficulty, and region
	// This prevents exact duplicates while allowing variations
	result := database.DB.Model(&models.Puzzle{}).
		Where("title = ? AND difficulty = ? AND region = ? AND decade = ?", 
			puzzle.Title, puzzle.Difficulty, puzzle.Region, puzzle.Decade).
		Count(&count)
	
	if result.Error != nil {
		// If there's an error checking, log it but don't block creation
		fmt.Printf("   ⚠️  Warning: Could not check for duplicates: %v\n", result.Error)
		return false
	}
	
	return count > 0
}
