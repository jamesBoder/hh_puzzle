package models

import "time"

// Leaderboard represents weekly leaderboard entries
type Leaderboard struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	UserID                uint      `gorm:"not null;index;uniqueIndex:idx_user_week" json:"user_id"`
	
	// Time period
	WeekStartDate         time.Time `gorm:"not null;index;uniqueIndex:idx_user_week" json:"week_start_date"`
	WeekEndDate           time.Time `gorm:"not null;index" json:"week_end_date"`
	
	// Stats for the week
	TotalPoints           int       `gorm:"default:0" json:"total_points"`
	PuzzlesCompleted      int       `gorm:"default:0" json:"puzzles_completed"`
	AverageCompletionTime *int      `json:"average_completion_time,omitempty"` // in seconds
	
	// Ranking
	Rank                  *int      `gorm:"index" json:"rank,omitempty"`
	
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

// TableName specifies the table name for Leaderboard model
func (Leaderboard) TableName() string {
	return "leaderboards"
}