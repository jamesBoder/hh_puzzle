package models

import "time"

// PuzzleAttempt represents a user's attempt at solving a puzzle
type PuzzleAttempt struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UserID             uint      `gorm:"not null;index;uniqueIndex:idx_user_puzzle" json:"user_id"`
	PuzzleID           uint      `gorm:"not null;index;uniqueIndex:idx_user_puzzle" json:"puzzle_id"`
	
	// Progress tracking
	CurrentState       JSONB     `gorm:"type:jsonb" json:"current_state,omitempty"`
	IsCompleted        bool      `gorm:"default:false;index" json:"is_completed"`
	CompletionTime     *int      `json:"completion_time,omitempty"` // in seconds
	
	// Scoring
	HintsUsed          int       `gorm:"default:0" json:"hints_used"`
	PointsEarned       int       `gorm:"default:0;index" json:"points_earned"`
	AccuracyPercentage *float64  `gorm:"type:decimal(5,2)" json:"accuracy_percentage,omitempty"`
	
	// Timestamps
	CreatedAt          time.Time  `json:"created_at"`
	StartedAt          time.Time  `json:"started_at"`
	CompletedAt        *time.Time `gorm:"index" json:"completed_at,omitempty"`
	UpdatedAt          time.Time  `json:"updated_at"`

	// Relationships
	User   User   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Puzzle Puzzle `gorm:"foreignKey:PuzzleID;constraint:OnDelete:CASCADE" json:"puzzle,omitempty"`
}

// TableName specifies the table name for PuzzleAttempt model
func (PuzzleAttempt) TableName() string {
	return "puzzle_attempts"
}