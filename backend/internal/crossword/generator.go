package crossword

import (
	"encoding/json"
	"fmt"
	"strconv"

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
	var decade, region string
	if len(originalWords) > 0 {
		decade = originalWords[0].Decade
		region = originalWords[0].Region
	}

	return &models.Puzzle{
		Title:         generateTitle(originalWords, difficulty),
		Description:   generateDescription(originalWords, difficulty),
		Difficulty:    difficulty,
		GridData:      gridData,
		CluesAcross:   cluesAcross,
		CluesDown:     cluesDown,
		EstimatedTime: estimatedTime,
		BasePoints:    basePoints,
		Decade:        decade,
		Region:        region,
	}
}

func generateTitle(words []HipHopWord, difficulty string) string {
	if len(words) == 0 {
		return "Hip-Hop Crossword Puzzle"
	}

	// Use metadata from first word to create title
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

// Helper function to convert placement to clue number
func placementToClueNumber(placement *crossword.Placement) string {
	// Use X and Y coordinates to generate a unique clue number
	// This is a simple implementation - you might want to improve this
	return strconv.Itoa(placement.Y*100 + placement.X)
}
