package crossword

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/warmans/go-crossword"
	"hh_puzzle/internal/models"
)

type HipHopGenerator struct {
	gridSize int
}

func NewHipHopGenerator(gridSize int) *HipHopGenerator {
	return &HipHopGenerator{gridSize: gridSize}
}

func (g *HipHopGenerator) GeneratePuzzle(
	words []HipHopWord,
	difficulty string,
	attempts int,
) (*models.Puzzle, error) {

	// Convert to go-crossword format
	cwWords := make([]crossword.Word, len(words))
	for i, w := range words {
		cwWords[i] = crossword.Word{
			Word: w.Answer,
			Clue: w.Clue,
		}
	}

	// Generate crossword
	cw := crossword.Generate(
		g.gridSize,
		cwWords,
		attempts,
		crossword.WithAllAttempts(true),
		crossword.WithRevealFirstLetterOfEachWord(true),
	)

	// Convert to our format
	puzzle := g.convertToPuzzle(cw, words, difficulty)

	return puzzle, nil
}

type HipHopWord struct {
	Answer   string
	Clue     string
	Decade   string
	Region   string
	City     string
	Category string
}

func (g *HipHopGenerator) convertToPuzzle(
	cw *crossword.Crossword,
	originalWords []HipHopWord,
	difficulty string,
) *models.Puzzle {

	// Convert grid to JSONB format
	gridData := make(models.JSONB)
	gridJSON, _ := json.Marshal(cw.Grid)
	var gridMap map[string]interface{}
	json.Unmarshal(gridJSON, &gridMap)
	gridData = gridMap

	// Separate clues into across and down
	cluesAcross := make(models.JSONB)
	cluesDown := make(models.JSONB)

	for _, placement := range cw.Words {
		clueID := placement.ClueID()
		clueData := map[string]interface{}{
			"clue":   placement.Word.Clue,
			"answer": placement.Word.Word,
			"x":      placement.X,
			"y":      placement.Y,
			"length": len(placement.Word.Word),
		}

		if placement.Vertical {
			cluesDown[clueID] = clueData
		} else {
			cluesAcross[clueID] = clueData
		}
	}

	// Set points and time based on difficulty
	basePoints := 100
	estimatedTime := 15
	switch difficulty {
	case "intermediate":
		basePoints = 200
		estimatedTime = 20
	case "expert":
		basePoints = 300
		estimatedTime = 30
	}

	// Extract metadata from words
	var decade, region, city string
	if len(originalWords) > 0 {
		decade = originalWords[0].Decade
		region = originalWords[0].Region
		city = originalWords[0].City
	}

	// Generate a unique identifier based on puzzle content
	contentHash := generateContentHash(cw)

	return &models.Puzzle{
		Title:         generateTitle(originalWords, difficulty, contentHash),
		Description:   generateDescription(originalWords, difficulty),
		Difficulty:    difficulty,
		GridData:      gridData,
		CluesAcross:   cluesAcross,
		CluesDown:     cluesDown,
		EstimatedTime: estimatedTime,
		BasePoints:    basePoints,
		Decade:        decade,
		Region:        region,
		City:          city,
	}
}

func generateTitle(words []HipHopWord, difficulty string, contentHash string) string {
	if len(words) == 0 {
		return "Hip-Hop Crossword Puzzle"
	}

	// Use metadata from first word to create base title
	title := "Hip-Hop Puzzle"

	if words[0].Decade != "" {
		title = words[0].Decade + " Hip-Hop Puzzle"
	}

	if words[0].Region != "" {
		title = words[0].Region + " " + title
	}

	// Add difficulty indicator
	switch difficulty {
	case "beginner":
		title += " (Easy)"
	case "intermediate":
		title += " (Medium)"
	case "expert":
		title += " (Hard)"
	}

	// Add unique identifier using first 6 characters of content hash
	// This ensures each puzzle has a unique title even with same metadata
	if len(contentHash) >= 6 {
		title += " #" + contentHash[:6]
	}

	return title
}

func generateDescription(words []HipHopWord, difficulty string) string {
	if len(words) == 0 {
		return "Test your hip-hop knowledge with this crossword puzzle"
	}

	wordCount := len(words)
	desc := fmt.Sprintf("A %s-level crossword puzzle featuring %d hip-hop related clues", 
		difficulty, wordCount)

	if words[0].Decade != "" {
		desc += fmt.Sprintf(" from the %s era", words[0].Decade)
	}

	if words[0].Region != "" {
		desc += fmt.Sprintf(" focusing on %s hip-hop", words[0].Region)
	}

	desc += ". Test your knowledge of artists, albums, and hip-hop culture!"

	return desc
}

// generateContentHash creates a unique hash based on puzzle content
func generateContentHash(cw *crossword.Crossword) string {
	// Collect all words and their positions to create a unique signature
	var content strings.Builder
	
	// Sort words by position for consistent hashing
	type wordPos struct {
		word string
		x, y int
		vert bool
	}
	
	positions := make([]wordPos, 0, len(cw.Words))
	for _, placement := range cw.Words {
		positions = append(positions, wordPos{
			word: placement.Word.Word,
			x:    placement.X,
			y:    placement.Y,
			vert: placement.Vertical,
		})
	}
	
	// Sort by position for consistency
	sort.Slice(positions, func(i, j int) bool {
		if positions[i].y != positions[j].y {
			return positions[i].y < positions[j].y
		}
		return positions[i].x < positions[j].x
	})
	
	// Build content string
	for _, pos := range positions {
		content.WriteString(fmt.Sprintf("%s:%d:%d:%v;", pos.word, pos.x, pos.y, pos.vert))
	}
	
	// Generate MD5 hash
	hash := md5.Sum([]byte(content.String()))
	return hex.EncodeToString(hash[:])
}

// GetPuzzleContentHash returns a hash of the puzzle's content for duplicate detection
func GetPuzzleContentHash(puzzle *models.Puzzle) string {
	var content strings.Builder
	
	// Collect all answers from clues
	answers := make([]string, 0)
	
	// Extract answers from across clues
	for _, clueData := range puzzle.CluesAcross {
		if clueMap, ok := clueData.(map[string]interface{}); ok {
			if answer, ok := clueMap["answer"].(string); ok {
				answers = append(answers, answer)
			}
		}
	}
	
	// Extract answers from down clues
	for _, clueData := range puzzle.CluesDown {
		if clueMap, ok := clueData.(map[string]interface{}); ok {
			if answer, ok := clueMap["answer"].(string); ok {
				answers = append(answers, answer)
			}
		}
	}
	
	// Sort for consistent hashing
	sort.Strings(answers)
	
	// Build content string
	for _, answer := range answers {
		content.WriteString(answer + ";")
	}
	
	// Generate MD5 hash
	hash := md5.Sum([]byte(content.String()))
	return hex.EncodeToString(hash[:])
}

// CalculatePuzzleSimilarity calculates similarity between two puzzles (0.0 to 1.0)
func CalculatePuzzleSimilarity(puzzle1, puzzle2 *models.Puzzle) float64 {
	// Extract answers from both puzzles
	answers1 := extractAnswers(puzzle1)
	answers2 := extractAnswers(puzzle2)
	
	if len(answers1) == 0 || len(answers2) == 0 {
		return 0.0
	}
	
	// Count common answers
	commonCount := 0
	answerSet := make(map[string]bool)
	for _, answer := range answers1 {
		answerSet[answer] = true
	}
	
	for _, answer := range answers2 {
		if answerSet[answer] {
			commonCount++
		}
	}
	
	// Calculate similarity as percentage of common answers
	maxLen := len(answers1)
	if len(answers2) > maxLen {
		maxLen = len(answers2)
	}
	
	return float64(commonCount) / float64(maxLen)
}

// extractAnswers extracts all answers from a puzzle
func extractAnswers(puzzle *models.Puzzle) []string {
	answers := make([]string, 0)
	
	// Extract from across clues
	for _, clueData := range puzzle.CluesAcross {
		if clueMap, ok := clueData.(map[string]interface{}); ok {
			if answer, ok := clueMap["answer"].(string); ok {
				answers = append(answers, answer)
			}
		}
	}
	
	// Extract from down clues
	for _, clueData := range puzzle.CluesDown {
		if clueMap, ok := clueData.(map[string]interface{}); ok {
			if answer, ok := clueMap["answer"].(string); ok {
				answers = append(answers, answer)
			}
		}
	}
	
	return answers
}

// Helper function to convert placement to clue number
func placementToClueNumber(placement *crossword.Placement) string {
	// Use X and Y coordinates to generate a unique clue number
	// This is a simple implementation - you might want to improve this
	return strconv.Itoa(placement.Y*100 + placement.X)
}
