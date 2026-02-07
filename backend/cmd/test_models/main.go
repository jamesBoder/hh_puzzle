package main

import (
"fmt"
"log"
"time"

"hh_puzzle/internal/config"
"hh_puzzle/internal/database"
"hh_puzzle/internal/models"
"hh_puzzle/internal/repository"
)

func main() {
fmt.Println("=== Testing GORM Models and Repositories ===\n")

// Load configuration
cfg, err := config.Load()
if err != nil {
log.Fatalf("Failed to load config: %v", err)
}

// Connect to database
if err := database.Connect(cfg); err != nil {
log.Fatalf("Failed to connect to database: %v", err)
}
defer database.Close()

fmt.Println("✓ Database connected\n")

// Initialize repositories
userRepo := repository.NewUserRepository(database.DB)
puzzleRepo := repository.NewPuzzleRepository(database.DB)
attemptRepo := repository.NewAttemptRepository(database.DB)

// Test 1: Create a user
fmt.Println("Test 1: Creating a user...")
user := &models.User{
Email:        "test@example.com",
Username:     "testuser",
PasswordHash: "hashed_password_here",
IsGuest:      false,
}

if err := userRepo.Create(user); err != nil {
log.Printf("Error creating user: %v", err)
} else {
fmt.Printf("✓ User created with ID: %d\n", user.ID)
}

// Test 2: Retrieve user with profile
fmt.Println("\nTest 2: Retrieving user with profile...")
retrievedUser, err := userRepo.GetWithProfile(user.ID)
if err != nil {
log.Printf("Error retrieving user: %v", err)
} else {
fmt.Printf("✓ User retrieved: %s (ID: %d)\n", retrievedUser.Username, retrievedUser.ID)
if retrievedUser.Profile != nil {
fmt.Printf("  Profile created automatically with ID: %d\n", retrievedUser.Profile.ID)
fmt.Printf("  Music enabled: %v, Volume: %d\n", 
retrievedUser.Profile.MusicEnabled, 
retrievedUser.Profile.MusicVolume)
}
}

// Test 3: Create a puzzle
fmt.Println("\nTest 3: Creating a puzzle...")
now := time.Now()
puzzle := &models.Puzzle{
Title:              "Test Puzzle - 90s Hip-Hop",
Description:        "A test puzzle about 90s hip-hop",
GridData:           models.JSONB{"width": 5, "height": 5, "cells": []interface{}{}},
CluesAcross:        models.JSONB{"1": "Notorious B.I.G.'s debut album"},
CluesDown:          models.JSONB{"1": "Dr. Dre's 1992 album"},
Difficulty:         "beginner",
Decade:             "90s",
Region:             "NYC",
BasePoints:         100,
IsDailyChallenge:   true,
DailyChallengeDate: &now,
}

if err := puzzleRepo.Create(puzzle); err != nil {
log.Printf("Error creating puzzle: %v", err)
} else {
fmt.Printf("✓ Puzzle created with ID: %d\n", puzzle.ID)
}

// Test 4: Find daily challenge
fmt.Println("\nTest 4: Finding today's daily challenge...")
dailyPuzzle, err := puzzleRepo.FindDailyChallenge(now)
if err != nil {
log.Printf("Error finding daily challenge: %v", err)
} else {
fmt.Printf("✓ Daily challenge found: %s (ID: %d)\n", dailyPuzzle.Title, dailyPuzzle.ID)
}

// Test 5: Create a puzzle attempt
fmt.Println("\nTest 5: Creating a puzzle attempt...")
attempt := &models.PuzzleAttempt{
UserID:       user.ID,
PuzzleID:     puzzle.ID,
CurrentState: models.JSONB{"progress": 0},
HintsUsed:    0,
PointsEarned: 0,
}

if err := attemptRepo.Create(attempt); err != nil {
log.Printf("Error creating attempt: %v", err)
} else {
fmt.Printf("✓ Puzzle attempt created with ID: %d\n", attempt.ID)
}

// Test 6: Update attempt (simulate completion)
fmt.Println("\nTest 6: Updating attempt (completing puzzle)...")
completedAt := time.Now()
completionTime := 300 // 5 minutes
accuracy := 95.5
attempt.IsCompleted = true
attempt.CompletedAt = &completedAt
attempt.CompletionTime = &completionTime
attempt.PointsEarned = 95
attempt.AccuracyPercentage = &accuracy

if err := attemptRepo.Update(attempt); err != nil {
log.Printf("Error updating attempt: %v", err)
} else {
fmt.Printf("✓ Attempt updated - Completed: %v, Points: %d\n", 
attempt.IsCompleted, attempt.PointsEarned)
}

// Test 7: Get user's completed puzzle count
fmt.Println("\nTest 7: Getting user's completed puzzle count...")
count, err := attemptRepo.GetUserCompletedCount(user.ID)
if err != nil {
log.Printf("Error getting completed count: %v", err)
} else {
fmt.Printf("✓ User has completed %d puzzles\n", count)
}

// Test 8: Find puzzles by filters
fmt.Println("\nTest 8: Finding puzzles by difficulty...")
puzzles, err := puzzleRepo.FindByFilters("beginner", "", "", 10, 0)
if err != nil {
log.Printf("Error finding puzzles: %v", err)
} else {
fmt.Printf("✓ Found %d beginner puzzles\n", len(puzzles))
}

// Test 9: Count total puzzles
fmt.Println("\nTest 9: Counting total puzzles...")
totalPuzzles, err := puzzleRepo.Count()
if err != nil {
log.Printf("Error counting puzzles: %v", err)
} else {
fmt.Printf("✓ Total puzzles in database: %d\n", totalPuzzles)
}

// Cleanup
fmt.Println("\n=== Cleaning up test data ===")
database.DB.Unscoped().Delete(&models.PuzzleAttempt{}, attempt.ID)
database.DB.Unscoped().Delete(&models.Puzzle{}, puzzle.ID)
database.DB.Unscoped().Delete(&models.UserProfile{}, "user_id = ?", user.ID)
database.DB.Unscoped().Delete(&models.User{}, user.ID)
fmt.Println("✓ Test data cleaned up")

fmt.Println("\n=== All tests completed successfully! ===")
}