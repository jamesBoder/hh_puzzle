package main

import (
	"fmt"
	"log"
	"strings"

	"hh_puzzle/internal/config"
	"hh_puzzle/internal/database"
	"hh_puzzle/internal/models"
)

func main() {
	fmt.Println("📊 HH_Puzzle - Puzzle Analysis Tool")
	fmt.Println("====================================\n")

	// Load config and connect to database
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	err = database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run analysis
	analyzer := NewPuzzleAnalyzer()
	report := analyzer.Analyze()

	// Print report
	printAnalysisReport(report)
}

// PuzzleAnalyzer analyzes generated puzzles
type PuzzleAnalyzer struct{}

// NewPuzzleAnalyzer creates a new puzzle analyzer
func NewPuzzleAnalyzer() *PuzzleAnalyzer {
	return &PuzzleAnalyzer{}
}

// AnalysisReport contains the results of puzzle analysis
type AnalysisReport struct {
	TotalPuzzles       int
	DifficultyDist     map[string]int
	RegionDist         map[string]int
	DecadeDist         map[string]int
	CityDist           map[string]int
	AvgBasePoints      float64
	AvgEstimatedTime   float64
	DailyChallenge     int
	PuzzlesWithPacks   int
	PuzzlesWithoutPacks int
	QualityMetrics     *QualityMetrics
}

// QualityMetrics contains quality-related metrics
type QualityMetrics struct {
	AvgCluesAcross    float64
	AvgCluesDown      float64
	MinClues          int
	MaxClues          int
	PuzzlesWithFewClues int // Less than 10 total clues
}

// Analyze performs comprehensive analysis of all puzzles
func (pa *PuzzleAnalyzer) Analyze() *AnalysisReport {
	var puzzles []models.Puzzle
	result := database.DB.Find(&puzzles)
	if result.Error != nil {
		log.Fatalf("Failed to fetch puzzles: %v", result.Error)
	}

	report := &AnalysisReport{
		TotalPuzzles:   len(puzzles),
		DifficultyDist: make(map[string]int),
		RegionDist:     make(map[string]int),
		DecadeDist:     make(map[string]int),
		CityDist:       make(map[string]int),
		QualityMetrics: &QualityMetrics{
			MinClues: 999,
			MaxClues: 0,
		},
	}

	if len(puzzles) == 0 {
		return report
	}

	totalPoints := 0
	totalTime := 0
	totalCluesAcross := 0
	totalCluesDown := 0

	for _, puzzle := range puzzles {
		// Difficulty distribution
		report.DifficultyDist[puzzle.Difficulty]++

		// Region distribution
		if puzzle.Region != "" {
			report.RegionDist[puzzle.Region]++
		}

		// Decade distribution
		if puzzle.Decade != "" {
			report.DecadeDist[puzzle.Decade]++
		}

		// City distribution
		if puzzle.City != "" {
			report.CityDist[puzzle.City]++
		}

		// Points and time
		totalPoints += puzzle.BasePoints
		totalTime += puzzle.EstimatedTime

		// Daily challenge
		if puzzle.IsDailyChallenge {
			report.DailyChallenge++
		}

		// Pack association
		if puzzle.PuzzlePackID != nil {
			report.PuzzlesWithPacks++
		} else {
			report.PuzzlesWithoutPacks++
		}

		// Quality metrics - count clues
		cluesAcross := len(puzzle.CluesAcross)
		cluesDown := len(puzzle.CluesDown)
		totalClues := cluesAcross + cluesDown

		totalCluesAcross += cluesAcross
		totalCluesDown += cluesDown

		if totalClues < report.QualityMetrics.MinClues {
			report.QualityMetrics.MinClues = totalClues
		}
		if totalClues > report.QualityMetrics.MaxClues {
			report.QualityMetrics.MaxClues = totalClues
		}
		if totalClues < 10 {
			report.QualityMetrics.PuzzlesWithFewClues++
		}
	}

	// Calculate averages
	report.AvgBasePoints = float64(totalPoints) / float64(len(puzzles))
	report.AvgEstimatedTime = float64(totalTime) / float64(len(puzzles))
	report.QualityMetrics.AvgCluesAcross = float64(totalCluesAcross) / float64(len(puzzles))
	report.QualityMetrics.AvgCluesDown = float64(totalCluesDown) / float64(len(puzzles))

	return report
}

// printAnalysisReport prints a formatted analysis report
func printAnalysisReport(report *AnalysisReport) {
	fmt.Println(strings.Repeat("=", 70))
	fmt.Println("📈 PUZZLE DATABASE ANALYSIS")
	fmt.Println(strings.Repeat("=", 70))

	// Overall stats
	fmt.Println("\n📊 Overall Statistics:")
	fmt.Println(strings.Repeat("-", 70))
	fmt.Printf("Total puzzles in database: %d\n", report.TotalPuzzles)
	fmt.Printf("Average base points: %.1f\n", report.AvgBasePoints)
	fmt.Printf("Average estimated time: %.1f minutes\n", report.AvgEstimatedTime)
	fmt.Printf("Daily challenges: %d\n", report.DailyChallenge)
	fmt.Printf("Puzzles in packs: %d\n", report.PuzzlesWithPacks)
	fmt.Printf("Standalone puzzles: %d\n", report.PuzzlesWithoutPacks)

	// Difficulty distribution
	fmt.Println("\n🎯 Difficulty Distribution:")
	fmt.Println(strings.Repeat("-", 70))
	total := report.TotalPuzzles
	if total > 0 {
		for _, diff := range []string{"beginner", "intermediate", "expert"} {
			count := report.DifficultyDist[diff]
			pct := float64(count) / float64(total) * 100
			bar := strings.Repeat("█", int(pct/2))
			fmt.Printf("%-15s: %3d (%.1f%%) %s\n", strings.Title(diff), count, pct, bar)
		}

		// Check if distribution is balanced
		beginnerPct := float64(report.DifficultyDist["beginner"]) / float64(total) * 100
		intermediatePct := float64(report.DifficultyDist["intermediate"]) / float64(total) * 100
		expertPct := float64(report.DifficultyDist["expert"]) / float64(total) * 100

		fmt.Println("\n📋 Balance Assessment:")
		fmt.Println("  Target: 40% beginner, 40% intermediate, 20% expert")
		
		if beginnerPct >= 35 && beginnerPct <= 45 &&
			intermediatePct >= 35 && intermediatePct <= 45 &&
			expertPct >= 15 && expertPct <= 25 {
			fmt.Println("  ✅ Difficulty distribution is well-balanced!")
		} else {
			fmt.Println("  ⚠️  Difficulty distribution needs adjustment:")
			if beginnerPct < 35 {
				fmt.Println("     - Need more beginner puzzles")
			} else if beginnerPct > 45 {
				fmt.Println("     - Too many beginner puzzles")
			}
			if intermediatePct < 35 {
				fmt.Println("     - Need more intermediate puzzles")
			} else if intermediatePct > 45 {
				fmt.Println("     - Too many intermediate puzzles")
			}
			if expertPct < 15 {
				fmt.Println("     - Need more expert puzzles")
			} else if expertPct > 25 {
				fmt.Println("     - Too many expert puzzles")
			}
		}
	}

	// Regional distribution
	if len(report.RegionDist) > 0 {
		fmt.Println("\n🌍 Regional Distribution:")
		fmt.Println(strings.Repeat("-", 70))
		for region, count := range report.RegionDist {
			pct := float64(count) / float64(total) * 100
			fmt.Printf("%-20s: %3d (%.1f%%)\n", region, count, pct)
		}
	}

	// Decade distribution
	if len(report.DecadeDist) > 0 {
		fmt.Println("\n📅 Decade Distribution:")
		fmt.Println(strings.Repeat("-", 70))
		decades := []string{"80s", "90s", "2000s", "2010s", "2020s"}
		for _, decade := range decades {
			if count, exists := report.DecadeDist[decade]; exists {
				pct := float64(count) / float64(total) * 100
				fmt.Printf("%-10s: %3d (%.1f%%)\n", decade, count, pct)
			}
		}
	}

	// City distribution (top 10)
	if len(report.CityDist) > 0 {
		fmt.Println("\n🏙️  Top Cities:")
		fmt.Println(strings.Repeat("-", 70))
		
		// Sort cities by count
		type cityCount struct {
			city  string
			count int
		}
		cities := make([]cityCount, 0, len(report.CityDist))
		for city, count := range report.CityDist {
			cities = append(cities, cityCount{city, count})
		}
		
		// Simple bubble sort (good enough for small lists)
		for i := 0; i < len(cities); i++ {
			for j := i + 1; j < len(cities); j++ {
				if cities[j].count > cities[i].count {
					cities[i], cities[j] = cities[j], cities[i]
				}
			}
		}
		
		// Print top 10
		limit := 10
		if len(cities) < limit {
			limit = len(cities)
		}
		for i := 0; i < limit; i++ {
			pct := float64(cities[i].count) / float64(total) * 100
			fmt.Printf("%2d. %-20s: %3d (%.1f%%)\n", i+1, cities[i].city, cities[i].count, pct)
		}
	}

	// Quality metrics
	fmt.Println("\n⭐ Quality Metrics:")
	fmt.Println(strings.Repeat("-", 70))
	fmt.Printf("Average clues across: %.1f\n", report.QualityMetrics.AvgCluesAcross)
	fmt.Printf("Average clues down: %.1f\n", report.QualityMetrics.AvgCluesDown)
	fmt.Printf("Average total clues: %.1f\n", 
		report.QualityMetrics.AvgCluesAcross + report.QualityMetrics.AvgCluesDown)
	fmt.Printf("Min clues in a puzzle: %d\n", report.QualityMetrics.MinClues)
	fmt.Printf("Max clues in a puzzle: %d\n", report.QualityMetrics.MaxClues)
	
	if report.QualityMetrics.PuzzlesWithFewClues > 0 {
		fmt.Printf("\n⚠️  Warning: %d puzzles have fewer than 10 clues (may be too simple)\n", 
			report.QualityMetrics.PuzzlesWithFewClues)
	} else {
		fmt.Println("\n✅ All puzzles have adequate complexity (10+ clues)")
	}

	// Recommendations
	fmt.Println("\n💡 Recommendations:")
	fmt.Println(strings.Repeat("-", 70))
	
	recommendations := []string{}
	
	// Check difficulty balance
	if total > 0 {
		beginnerPct := float64(report.DifficultyDist["beginner"]) / float64(total) * 100
		expertPct := float64(report.DifficultyDist["expert"]) / float64(total) * 100
		
		if beginnerPct < 35 {
			recommendations = append(recommendations, 
				"Create more beginner-level word lists (mainstream artists, recent decades)")
		}
		if expertPct < 15 {
			recommendations = append(recommendations, 
				"Create more expert-level word lists (underground artists, producers, deep cuts)")
		}
	}
	
	// Check regional diversity
	if len(report.RegionDist) < 4 {
		recommendations = append(recommendations, 
			"Add more regional diversity (ensure coverage of East Coast, West Coast, South, Midwest)")
	}
	
	// Check decade coverage
	if len(report.DecadeDist) < 3 {
		recommendations = append(recommendations, 
			"Expand decade coverage (aim for 80s, 90s, 2000s, 2010s, 2020s)")
	}
	
	// Check quality
	if report.QualityMetrics.PuzzlesWithFewClues > total/10 {
		recommendations = append(recommendations, 
			"Review puzzles with few clues - may need larger word lists")
	}
	
	if len(recommendations) == 0 {
		fmt.Println("  ✅ Puzzle collection looks great! No major issues detected.")
	} else {
		for i, rec := range recommendations {
			fmt.Printf("  %d. %s\n", i+1, rec)
		}
	}

	// Summary
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("📋 SUMMARY")
	fmt.Println(strings.Repeat("=", 70))
	
	if total == 0 {
		fmt.Println("❌ No puzzles found in database. Run puzzle generator first.")
	} else if total < 50 {
		fmt.Printf("⚠️  Only %d puzzles in database. Aim for 150-250 for launch.\n", total)
	} else if total < 150 {
		fmt.Printf("📈 %d puzzles generated. Getting close to launch target (150-250).\n", total)
	} else {
		fmt.Printf("✅ %d puzzles generated. Ready for launch!\n", total)
	}
	
	fmt.Println("\n🎯 Next Steps:")
	fmt.Println("  1. Test puzzles via API: GET /api/puzzles")
	fmt.Println("  2. Review difficulty distribution and adjust word lists if needed")
	fmt.Println("  3. Create puzzle packs for monetization")
	fmt.Println("  4. Set up daily challenge rotation")
	
	fmt.Println("\n✅ Analysis complete!")
}
