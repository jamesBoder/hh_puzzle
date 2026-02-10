package utils

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"hh_puzzle/internal/crossword"
)

// ValidationResult represents the result of validating a word list
type ValidationResult struct {
	FileName     string
	TotalEntries int
	Errors       []ValidationError
	Warnings     []ValidationWarning
	IsValid      bool
}

// ValidationError represents a critical error in a word entry
type ValidationError struct {
	LineNumber int
	Answer     string
	Issue      string
}

// ValidationWarning represents a non-critical issue in a word entry
type ValidationWarning struct {
	LineNumber int
	Answer     string
	Issue      string
}

// WordValidator validates word list JSON files
type WordValidator struct {
	MaxAnswerLength      int
	MinAnswerLength      int
	RecommendedMaxLength int
	MinClueLength        int
}

// NewWordValidator creates a new word validator with default settings
func NewWordValidator() *WordValidator {
	return &WordValidator{
		MaxAnswerLength:      20, // Grid is 20x20
		MinAnswerLength:      2,
		RecommendedMaxLength: 15, // Recommended for better puzzle generation
		MinClueLength:        10, // Minimum descriptive clue length
	}
}

// ValidateFile validates a single word list file
func (v *WordValidator) ValidateFile(filePath string) (*ValidationResult, error) {
	// Read file
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Parse JSON
	var words []crossword.HipHopWord
	if err := json.Unmarshal(data, &words); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	result := &ValidationResult{
		FileName:     filepath.Base(filePath),
		TotalEntries: len(words),
		Errors:       []ValidationError{},
		Warnings:     []ValidationWarning{},
		IsValid:      true,
	}

	// Track seen answers for duplicate detection
	seenAnswers := make(map[string]int)

	// Validate each word
	for i, word := range words {
		lineNum := i + 1

		// Check answer length
		answerLen := len(word.Answer)
		if answerLen > v.MaxAnswerLength {
			result.Errors = append(result.Errors, ValidationError{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      fmt.Sprintf("Answer exceeds maximum length (%d > %d)", answerLen, v.MaxAnswerLength),
			})
			result.IsValid = false
		} else if answerLen > v.RecommendedMaxLength {
			result.Warnings = append(result.Warnings, ValidationWarning{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      fmt.Sprintf("Answer exceeds recommended length (%d > %d)", answerLen, v.RecommendedMaxLength),
			})
		}

		if answerLen < v.MinAnswerLength {
			result.Errors = append(result.Errors, ValidationError{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      fmt.Sprintf("Answer too short (%d < %d)", answerLen, v.MinAnswerLength),
			})
			result.IsValid = false
		}

		// Check for empty answer
		if word.Answer == "" {
			result.Errors = append(result.Errors, ValidationError{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      "Answer is empty",
			})
			result.IsValid = false
		}

		// Check answer format (alphanumeric only, no spaces)
		if strings.ContainsAny(word.Answer, " -_.,!@#$%^&*()") {
			result.Errors = append(result.Errors, ValidationError{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      "Answer contains invalid characters (spaces or special chars)",
			})
			result.IsValid = false
		}

		// Check for uppercase
		if word.Answer != strings.ToUpper(word.Answer) {
			result.Warnings = append(result.Warnings, ValidationWarning{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      "Answer should be uppercase",
			})
		}

		// Check clue
		if word.Clue == "" {
			result.Errors = append(result.Errors, ValidationError{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      "Clue is empty",
			})
			result.IsValid = false
		} else if len(word.Clue) < v.MinClueLength {
			result.Warnings = append(result.Warnings, ValidationWarning{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      fmt.Sprintf("Clue is very short (%d chars)", len(word.Clue)),
			})
		}

		// Check if clue contains character count and if it matches
		if strings.Contains(word.Clue, "(") && strings.Contains(word.Clue, ")") {
			// Extract character count from clue
			start := strings.LastIndex(word.Clue, "(")
			end := strings.LastIndex(word.Clue, ")")
			if start < end {
				countStr := word.Clue[start+1 : end]
				expectedLen := fmt.Sprintf("%d", answerLen)
				if countStr != expectedLen {
					result.Errors = append(result.Errors, ValidationError{
						LineNumber: lineNum,
						Answer:     word.Answer,
						Issue:      fmt.Sprintf("Character count mismatch - clue says (%s) but answer is %d chars", countStr, answerLen),
					})
					result.IsValid = false
				}
			}
		}

		// Check for answer appearing verbatim in clue (case-insensitive)
		if strings.Contains(strings.ToLower(word.Clue), strings.ToLower(word.Answer)) {
			result.Warnings = append(result.Warnings, ValidationWarning{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      "Answer appears verbatim in clue",
			})
		}

		// Check for duplicates
		if prevLine, exists := seenAnswers[word.Answer]; exists {
			result.Errors = append(result.Errors, ValidationError{
				LineNumber: lineNum,
				Answer:     word.Answer,
				Issue:      fmt.Sprintf("Duplicate answer (first seen at line %d)", prevLine),
			})
			result.IsValid = false
		}
		seenAnswers[word.Answer] = lineNum
	}

	return result, nil
}

// ValidateDirectory validates all JSON files in a directory
func (v *WordValidator) ValidateDirectory(dirPath string) ([]*ValidationResult, error) {
	files, err := filepath.Glob(filepath.Join(dirPath, "*.json"))
	if err != nil {
		return nil, fmt.Errorf("failed to find JSON files: %w", err)
	}

	results := make([]*ValidationResult, 0, len(files))
	for _, file := range files {
		result, err := v.ValidateFile(file)
		if err != nil {
			return nil, fmt.Errorf("failed to validate %s: %w", file, err)
		}
		results = append(results, result)
	}

	return results, nil
}

// AnswerCategory represents an answer with its category
type AnswerCategory struct {
	Answer   string
	Category string
}

// CheckCrossFileDuplicates checks for duplicate answers across all files (same category only)
func (v *WordValidator) CheckCrossFileDuplicates(dirPath string) (map[string][]string, error) {
	files, err := filepath.Glob(filepath.Join(dirPath, "*.json"))
	if err != nil {
		return nil, fmt.Errorf("failed to find JSON files: %w", err)
	}

	// Map of (answer+category) -> list of files containing it
	answerCategoryFiles := make(map[AnswerCategory][]string)

	for _, file := range files {
		data, err := os.ReadFile(file)
		if err != nil {
			continue
		}

		var words []crossword.HipHopWord
		if err := json.Unmarshal(data, &words); err != nil {
			continue
		}

		fileName := filepath.Base(file)
		for _, word := range words {
			key := AnswerCategory{
				Answer:   strings.ToUpper(word.Answer),
				Category: strings.ToLower(word.Category),
			}
			answerCategoryFiles[key] = append(answerCategoryFiles[key], fileName)
		}
	}

	// Filter to only duplicates (same answer AND same category)
	duplicates := make(map[string][]string)
	for key, files := range answerCategoryFiles {
		if len(files) > 1 {
			label := fmt.Sprintf("%s (category: %s)", key.Answer, key.Category)
			duplicates[label] = files
		}
	}

	return duplicates, nil
}

// PrintValidationReport prints a formatted validation report
func PrintValidationReport(results []*ValidationResult, duplicates map[string][]string) {
	fmt.Println("📊 Word List Validation Report")
	fmt.Println("================================\n")

	totalEntries := 0
	totalErrors := 0
	totalWarnings := 0
	validFiles := 0

	for _, result := range results {
		totalEntries += result.TotalEntries
		totalErrors += len(result.Errors)
		totalWarnings += len(result.Warnings)

		if result.IsValid && len(result.Warnings) == 0 {
			fmt.Printf("✓ %s: %d entries, 0 errors, 0 warnings\n", result.FileName, result.TotalEntries)
			validFiles++
		} else if result.IsValid {
			fmt.Printf("⚠ %s: %d entries, 0 errors, %d warnings\n", result.FileName, result.TotalEntries, len(result.Warnings))
			for _, warning := range result.Warnings {
				fmt.Printf("  - Line %d (%s): %s\n", warning.LineNumber, warning.Answer, warning.Issue)
			}
		} else {
			fmt.Printf("❌ %s: %d entries, %d errors, %d warnings\n", result.FileName, result.TotalEntries, len(result.Errors), len(result.Warnings))
			for _, err := range result.Errors {
				fmt.Printf("  - Line %d (%s): %s\n", err.LineNumber, err.Answer, err.Issue)
			}
			for _, warning := range result.Warnings {
				fmt.Printf("  - Line %d (%s): %s\n", warning.LineNumber, warning.Answer, warning.Issue)
			}
		}
		fmt.Println()
	}

	// Print cross-file duplicates
	if len(duplicates) > 0 {
		fmt.Println("🔄 Cross-File Duplicates (Same Category):")
		fmt.Println("==========================================")
		for label, files := range duplicates {
			fmt.Printf("  %s appears in: %s\n", label, strings.Join(files, ", "))
		}
		fmt.Println()
	}

	// Summary
	fmt.Println("Summary:")
	fmt.Println("--------")
	fmt.Printf("Total files: %d\n", len(results))
	fmt.Printf("Valid files: %d\n", validFiles)
	fmt.Printf("Total entries: %d\n", totalEntries)
	fmt.Printf("Total errors: %d\n", totalErrors)
	fmt.Printf("Total warnings: %d\n", totalWarnings)
	fmt.Printf("Cross-file duplicates: %d\n", len(duplicates))

	if totalErrors == 0 && len(duplicates) == 0 {
		fmt.Println("\n✅ All word lists passed validation!")
	} else {
		fmt.Println("\n⚠️  Some issues found. Please review and fix before generating puzzles.")
	}
}
