package models

import "time"

// HipHopFact represents educational hip-hop content
type HipHopFact struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:200;not null" json:"title"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	Category    string    `gorm:"size:50;index" json:"category,omitempty"` // history, artist, terminology, production
	
	// Unlock conditions
	UnlockType  string    `gorm:"size:50;index" json:"unlock_type,omitempty"` // puzzle_completion, points_milestone, streak
	UnlockValue *int      `gorm:"index" json:"unlock_value,omitempty"` // puzzle_id, points threshold, or streak count
	
	// Media
	ImageURL    string    `gorm:"size:500" json:"image_url,omitempty"`
	SourceURL   string    `gorm:"size:500" json:"source_url,omitempty"`
	
	CreatedAt   time.Time `json:"created_at"`

	// Relationships
	UnlockedBy []UserUnlockedFact `gorm:"foreignKey:FactID;constraint:OnDelete:CASCADE" json:"unlocked_by,omitempty"`
}

// TableName specifies the table name for HipHopFact model
func (HipHopFact) TableName() string {
	return "hip_hop_facts"
}

// UserUnlockedFact represents facts unlocked by users
type UserUnlockedFact struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index;uniqueIndex:idx_user_fact" json:"user_id"`
	FactID     uint      `gorm:"not null;index;uniqueIndex:idx_user_fact" json:"fact_id"`
	UnlockedAt time.Time `json:"unlocked_at"`

	// Relationships
	User User       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Fact HipHopFact `gorm:"foreignKey:FactID;constraint:OnDelete:CASCADE" json:"fact,omitempty"`
}

// TableName specifies the table name for UserUnlockedFact model
func (UserUnlockedFact) TableName() string {
	return "user_unlocked_facts"
}