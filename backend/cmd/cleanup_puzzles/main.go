package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"

	"hh_puzzle/internal/config"
	"hh_puzzle/internal/database"
	"hh_puzzle/internal/models"
)

func main() {
	fmt.Println("🧹 HH_Puzzle - Database Cleanup Tool")
	fmt.Println("=====================================\n")

	// Load config and connect to database
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	err = database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("This tool will clean up puzzles that were generated from outdated word lists.")
	fmt.Println("\nProblematic entries that were fixed:")
	fmt.Println("  1. 'SOUTHERNPLAYALISTICADILLACMUZIK' (31 chars) → 'SOUTHERN' (8 chars)")
	fmt.Println("  2. 'LABCABINCALIFORNIA' (18 chars) → 'LABCABIN' (8 chars)")
	fmt.Println("  3. Duplicate 'CARTER' entries")
	fmt.Println("\nOptions:")
	fmt.Println("  1. Delete all puzzles and regenerate from scratch (RECOMMENDED)")
	fmt.Println("  2. Delete only problematic puzzles (keeps valid puzzles)")
	fmt.Println("  3. Analyze only (no changes)")
	fmt.Println("  4. Exit")

	var choice int
	fmt.Print("\nEnter your choice (1-4): ")
	fmt.Scanln(&choice)

	switch choice {
	case 1:
		deleteAllPuzzles()
	case 2:
		deleteProblematicPuzzles()
	case 3:
		analyzeProblematicPuzzles()
	case 4:
		fmt.Println("Exiting without changes.")
		return
	default:
		fmt.Println("Invalid choice. Exiting.")
		return
	}
}

// deleteAllPuzzles removes all puzzles from the database
func deleteAllPuzzles() {
	fmt.Println("\n⚠️  WARNING: This will delete ALL puzzles from the database!")
	fmt.Print("Type DELETE ALL to confirm: ")
	
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()
	confirmation := strings.TrimSpace(scanner.Text())
	
	if strings.ToUpper(confirmation) != "DELETE ALL" {
		fmt.Println("Cancelled. No changes made.")
		return
	}

	// Count existing puzzles
	var count int64
	database.DB.Model(&models.Puzzle{}).Count(&count)
	
	if count == 0 {
		fmt.Println("\n✅ Database is already empty. No puzzles to delete.")
		return
	}

	fmt.Printf("\nDeleting %d puzzles...\n", count)

	// Delete all puzzles
	result := database.DB.Unscoped().Delete(&models.Puzzle{}, "id > 0")
	if result.Error != nil {
		log.Fatalf("Failed to delete puzzles: %v", result.Error)
	}

	fmt.Printf("✅ Successfully deleted %d puzzles.\n", result.RowsAffected)
	fmt.Println("\n💡 Next steps:")
	fmt.Println("  1. Run: go run cmd/generate_puzzles/main.go")
	fmt.Println("  2. This will regenerate all puzzles with the corrected word lists")
	fmt.Println("  3. Run: go run cmd/analyze_puzzles/main.go to verify results")
}

// deleteProblematicPuzzles removes only puzzles with known issues
func deleteProblematicPuzzles() {
	fmt.Println("\n🔍 Searching for problematic puzzles...")

	var allPuzzles []models.Puzzle
	database.DB.Find(&allPuzzles)

	problematicIDs := []uint{}
	problematicReasons := make(map[uint]string)

	// Check each puzzle for problematic answers
	for _, puzzle := range allPuzzles {
		// Check clues for problematic answers
		hasProblems := false
		reason := ""

		// Check across clues
		for _, clueData := range puzzle.CluesAcross {
			if clueMap, ok := clueData.(map[string]interface{}); ok {
				if answer, ok := clueMap["answer"].(string); ok {
					answer = strings.ToUpper(answer)
					
					if answer == "SOUTHERNPLAYALISTICADILLACMUZIK" {
						hasProblems = true
						reason = "Contains old 'SOUTHERNPLAYALISTICADILLACMUZIK' answer"
					} else if answer == "LABCABINCALIFORNIA" {
						hasProblems = true
						reason = "Contains old 'LABCABINCALIFORNIA' answer"
					} else if len(answer) > 20 {
						hasProblems = true
						reason = fmt.Sprintf("Contains answer exceeding max length: '%s' (%d chars)", answer, len(answer))
					}
				}
			}
		}

		// Check down clues
		for _, clueData := range puzzle.CluesDown {
			if clueMap, ok := clueData.(map[string]interface{}); ok {
				if answer, ok := clueMap["answer"].(string); ok {
					answer = strings.ToUpper(answer)
					
					if answer == "SOUTHERNPLAYALISTICADILLACMUZIK" {
						hasProblems = true
						reason = "Contains old 'SOUTHERNPLAYALISTICADILLACMUZIK' answer"
					} else if answer == "LABCABINCALIFORNIA" {
						hasProblems = true
						reason = "Contains old 'LABCABINCALIFORNIA' answer"
					} else if len(answer) > 20 {
						hasProblems = true
						reason = fmt.Sprintf("Contains answer exceeding max length: '%s' (%d chars)", answer, len(answer))
					}
				}
			}
		}

		if hasProblems {
			problematicIDs = append(problematicIDs, puzzle.ID)
			problematicReasons[puzzle.ID] = reason
		}
	}

	if len(problematicIDs) == 0 {
		fmt.Println("\n✅ No problematic puzzles found! Database is clean.")
		return
	}

	fmt.Printf("\n⚠️  Found %d problematic puzzles:\n", len(problematicIDs))
	for _, id := range problematicIDs {
		fmt.Printf("  - Puzzle ID %d: %s\n", id, problematicReasons[id])
	}

	fmt.Printf("\nDelete these %d puzzles? (y/n): ", len(problematicIDs))
	var confirm string
	fmt.Scanln(&confirm)

	if confirm != "y" && confirm != "Y" {
		fmt.Println("Cancelled. No changes made.")
		return
	}

	// Delete problematic puzzles
	result := database.DB.Unscoped().Delete(&models.Puzzle{}, problematicIDs)
	if result.Error != nil {
		log.Fatalf("Failed to delete puzzles: %v", result.Error)
	}

	fmt.Printf("\n✅ Successfully deleted %d problematic puzzles.\n", result.RowsAffected)
	fmt.Printf("✅ Kept %d valid puzzles.\n", len(allPuzzles)-len(problematicIDs))
	
	fmt.Println("\n💡 Next steps:")
	fmt.Println("  1. Run: go run cmd/generate_puzzles/main.go")
	fmt.Println("  2. This will generate new puzzles from the corrected word lists")
	fmt.Println("  3. Run: go run cmd/analyze_puzzles/main.go to verify results")
}

// analyzeProblematicPuzzles shows what would be affected without making changes
func analyzeProblematicPuzzles() {
	fmt.Println("\n🔍 Analyzing database for problematic puzzles...")

	var allPuzzles []models.Puzzle
	database.DB.Find(&allPuzzles)

	fmt.Printf("\nTotal puzzles in database: %d\n", len(allPuzzles))

	problematicCount := 0
	validCount := 0
	issues := make(map[string]int)

	// Check each puzzle
	for _, puzzle := range allPuzzles {
		hasProblems := false

		// Check across clues
		for _, clueData := range puzzle.CluesAcross {
			if clueMap, ok := clueData.(map[string]interface{}); ok {
				if answer, ok := clueMap["answer"].(string); ok {
					answer = strings.ToUpper(answer)
					
					if answer == "SOUTHERNPLAYALISTICADILLACMUZIK" {
						hasProblems = true
						issues["Old SOUTHERNPLAYALISTICADILLACMUZIK"]++
					} else if answer == "LABCABINCALIFORNIA" {
						hasProblems = true
						issues["Old LABCABINCALIFORNIA"]++
					} else if len(answer) > 20 {
						hasProblems = true
						issues["Answer exceeds 20 chars"]++
					}
				}
			}
		}

		// Check down clues
		for _, clueData := range puzzle.CluesDown {
			if clueMap, ok := clueData.(map[string]interface{}); ok {
				if answer, ok := clueMap["answer"].(string); ok {
					answer = strings.ToUpper(answer)
					
					if answer == "SOUTHERNPLAYALISTICADILLACMUZIK" {
						hasProblems = true
						issues["Old SOUTHERNPLAYALISTICADILLACMUZIK"]++
					} else if answer == "LABCABINCALIFORNIA" {
						hasProblems = true
						issues["Old LABCABINCALIFORNIA"]++
					} else if len(answer) > 20 {
						hasProblems = true
						issues["Answer exceeds 20 chars"]++
					}
				}
			}
		}

		if hasProblems {
			problematicCount++
		} else {
			validCount++
		}
	}

	fmt.Println("\n📊 Analysis Results:")
	fmt.Println(strings.Repeat("-", 60))
	fmt.Printf("Valid puzzles: %d\n", validCount)
	fmt.Printf("Problematic puzzles: %d\n", problematicCount)

	if len(issues) > 0 {
		fmt.Println("\nIssues found:")
		for issue, count := range issues {
			fmt.Printf("  - %s: %d occurrences\n", issue, count)
		}
	}

	fmt.Println("\n💡 Recommendations:")
	if problematicCount == 0 {
		fmt.Println("  ✅ Database is clean! No action needed.")
	} else if problematicCount < len(allPuzzles)/10 {
		fmt.Println("  ⚠️  Run option 2 to delete only problematic puzzles")
		fmt.Println("  ⚠️  Then regenerate to replace them")
	} else {
		fmt.Println("  ⚠️  Many puzzles affected - recommend option 1 (delete all and regenerate)")
		fmt.Println("  ⚠️  This ensures consistency across all puzzles")
	}
}
