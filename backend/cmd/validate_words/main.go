package main

import (
	"fmt"
	"log"
	"os"

	"hh_puzzle/internal/utils"
)

func main() {
	fmt.Println("🔍 HH_Puzzle - Word List Validator")
	fmt.Println("===================================\n")

	// Check if directory argument is provided
	wordListDir := "data/words"
	if len(os.Args) > 1 {
		wordListDir = os.Args[1]
	}

	fmt.Printf("Validating word lists in: %s\n\n", wordListDir)

	// Create validator
	validator := utils.NewWordValidator()

	// Validate all files in directory
	results, err := validator.ValidateDirectory(wordListDir)
	if err != nil {
		log.Fatalf("Failed to validate directory: %v", err)
	}

	// Check for cross-file duplicates
	duplicates, err := validator.CheckCrossFileDuplicates(wordListDir)
	if err != nil {
		log.Fatalf("Failed to check cross-file duplicates: %v", err)
	}

	// Print report
	utils.PrintValidationReport(results, duplicates)

	// Exit with error code if validation failed
	hasErrors := false
	for _, result := range results {
		if !result.IsValid {
			hasErrors = true
			break
		}
	}

	if hasErrors || len(duplicates) > 0 {
		fmt.Println("\n❌ Validation failed. Please fix errors before generating puzzles.")
		os.Exit(1)
	}

	fmt.Println("\n✅ Validation passed! Word lists are ready for puzzle generation.")
	os.Exit(0)
}
