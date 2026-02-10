package crossword

import (
	"strings"
)

// DifficultyScorer calculates difficulty scores for hip-hop words
type DifficultyScorer struct {
	// Mainstream artists that are widely known
	MainstreamArtists map[string]bool
	// Underground/regional artists
	UndergroundArtists map[string]bool
}

// NewDifficultyScorer creates a new difficulty scorer
func NewDifficultyScorer() *DifficultyScorer {
	return &DifficultyScorer{
		MainstreamArtists: map[string]bool{
			"DRAKE":    true,
			"EMINEM":   true,
			"KANYE":    true,
			"JAYZ":     true,
			"KENDRICK": true,
			"CARDI":    true,
			"MIGOS":    true,
			"TRAVIS":   true,
			"FUTURE":   true,
			"LILWAYNE": true,
			"SNOOP":    true,
			"TUPAC":    true,
			"BIGGIE":   true,
			"NAS":      true,
			"JCOLE":    true,
			"LILBABY":  true,
			"DABABY":   true,
			"MEGAN":    true,
			"OUTKAST":  true,
			"RUNDMC":   true,
			"NWA":      true,
		},
		UndergroundArtists: map[string]bool{
			"WESTSIDE":  true,
			"BENNY":     true,
			"CONWAY":    true,
			"RAPSODY":   true,
			"FREDDIE":   true,
			"MFDOOM":    true,
			"IMMORTAL":  true,
			"JPEG":      true,
			"EARL":      true,
			"BLU":       true,
			"EXILE":     true,
			"EVIDENCE":  true,
			"FASHAWN":   true,
			"BUCKWILD":  true,
			"SHOWBIZ":   true,
			"ORGANIZED": true,
		},
	}
}

// CalculateScore calculates a difficulty score (0-100) for a word
// Score breakdown:
// - 0-40: Beginner
// - 41-70: Intermediate
// - 71-100: Expert
func (ds *DifficultyScorer) CalculateScore(word HipHopWord) int {
	score := 0

	// 1. Answer Length (20% weight, max 20 points)
	score += ds.scoreAnswerLength(word.Answer)

	// 2. Cultural Obscurity (30% weight, max 30 points)
	score += ds.scoreCulturalObscurity(word)

	// 3. Era Specificity (20% weight, max 20 points)
	score += ds.scoreEraSpecificity(word.Decade)

	// 4. Category Complexity (15% weight, max 15 points)
	score += ds.scoreCategoryComplexity(word.Category)

	// 5. Clue Directness (15% weight, max 15 points)
	score += ds.scoreClueDirectness(word.Clue, word.Answer)

	// Ensure score is within 0-100 range
	if score > 100 {
		score = 100
	}
	if score < 0 {
		score = 0
	}

	return score
}

// scoreAnswerLength scores based on answer length (max 20 points)
func (ds *DifficultyScorer) scoreAnswerLength(answer string) int {
	length := len(answer)

	switch {
	case length <= 4:
		return 5 // Very short, easier
	case length <= 6:
		return 8 // Short, still easy
	case length <= 8:
		return 12 // Medium
	case length <= 10:
		return 16 // Getting harder
	default:
		return 20 // Long, hardest
	}
}

// scoreCulturalObscurity scores based on how well-known the subject is (max 30 points)
func (ds *DifficultyScorer) scoreCulturalObscurity(word HipHopWord) int {
	answer := strings.ToUpper(word.Answer)

	// Check if mainstream
	if ds.MainstreamArtists[answer] {
		return 5 // Very well known
	}

	// Check if underground
	if ds.UndergroundArtists[answer] {
		return 28 // Very obscure
	}

	// Check category for general obscurity
	category := strings.ToLower(word.Category)
	switch category {
	case "artist", "group":
		return 15 // Medium - assume moderately known
	case "album", "song":
		return 18 // Slightly harder
	case "producer", "dj":
		return 22 // Harder - producers less known than artists
	case "label":
		return 24 // Even harder
	case "term", "slang":
		return 12 // Easier - common terms
	default:
		return 15 // Default medium
	}
}

// scoreEraSpecificity scores based on the decade (max 20 points)
func (ds *DifficultyScorer) scoreEraSpecificity(decade string) int {
	decade = strings.ToLower(decade)

	switch decade {
	case "2020s":
		return 4 // Current, very easy
	case "2010s":
		return 8 // Recent, easy
	case "2000s":
		return 12 // Medium
	case "90s":
		return 16 // Classic era, harder for younger audience
	case "80s":
		return 20 // Old school, hardest
	default:
		return 10 // No decade specified, medium
	}
}

// scoreCategoryComplexity scores based on category type (max 15 points)
func (ds *DifficultyScorer) scoreCategoryComplexity(category string) int {
	category = strings.ToLower(category)

	switch category {
	case "artist":
		return 3 // Easiest
	case "group":
		return 5 // Still easy
	case "album":
		return 8 // Medium
	case "song":
		return 9 // Medium-hard
	case "producer":
		return 12 // Hard
	case "dj":
		return 13 // Hard
	case "label":
		return 14 // Harder
	case "term", "slang":
		return 6 // Medium-easy
	default:
		return 8 // Default medium
	}
}

// scoreClueDirectness scores based on how direct the clue is (max 15 points)
func (ds *DifficultyScorer) scoreClueDirectness(clue, answer string) int {
	clue = strings.ToLower(clue)
	answer = strings.ToLower(answer)

	score := 8 // Default medium

	// Direct name mention makes it easier
	if strings.Contains(clue, answer) {
		score -= 3
	}

	// Specific achievements/songs make it easier
	if strings.Contains(clue, "known for") ||
		strings.Contains(clue, "behind") ||
		strings.Contains(clue, "featuring") {
		score -= 2
	}

	// Vague references make it harder
	if strings.Contains(clue, "member") ||
		strings.Contains(clue, "collective") ||
		strings.Contains(clue, "group") {
		score += 3
	}

	// Cryptic clues make it harder
	if strings.Contains(clue, "aka") ||
		strings.Contains(clue, "also known") ||
		strings.Contains(clue, "formerly") {
		score += 4
	}

	// Ensure within 0-15 range
	if score > 15 {
		score = 15
	}
	if score < 0 {
		score = 0
	}

	return score
}

// GetDifficultyLevel converts a score to a difficulty level
func (ds *DifficultyScorer) GetDifficultyLevel(score int) string {
	switch {
	case score <= 40:
		return "beginner"
	case score <= 70:
		return "intermediate"
	default:
		return "expert"
	}
}

// ScoreWords scores all words and returns them with difficulty levels
func (ds *DifficultyScorer) ScoreWords(words []HipHopWord) []ScoredWord {
	scored := make([]ScoredWord, len(words))
	for i, word := range words {
		score := ds.CalculateScore(word)
		scored[i] = ScoredWord{
			Word:       word,
			Score:      score,
			Difficulty: ds.GetDifficultyLevel(score),
		}
	}
	return scored
}

// ScoredWord represents a word with its difficulty score
type ScoredWord struct {
	Word       HipHopWord
	Score      int
	Difficulty string
}

// GetDifficultyDistribution returns the count of words at each difficulty level
func GetDifficultyDistribution(scoredWords []ScoredWord) map[string]int {
	distribution := map[string]int{
		"beginner":     0,
		"intermediate": 0,
		"expert":       0,
	}

	for _, sw := range scoredWords {
		distribution[sw.Difficulty]++
	}

	return distribution
}
