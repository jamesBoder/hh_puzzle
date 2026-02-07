package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user account
type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Email        string         `gorm:"uniqueIndex;size:255;not null" json:"email"`
	PasswordHash string         `gorm:"size:255" json:"-"` // Never send password in JSON
	Username     string         `gorm:"uniqueIndex;size:50;not null" json:"username"`
	IsGuest      bool           `gorm:"default:false" json:"is_guest"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Profile        *UserProfile     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"profile,omitempty"`
	OAuthAccounts  []OAuthAccount   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"oauth_accounts,omitempty"`
	PuzzleAttempts []PuzzleAttempt  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"puzzle_attempts,omitempty"`
	Leaderboards   []Leaderboard    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"leaderboards,omitempty"`
	Purchases      []Purchase       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"purchases,omitempty"`
	UnlockedFacts  []UserUnlockedFact `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"unlocked_facts,omitempty"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// UserProfile represents a user's profile and preferences
type UserProfile struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	UserID               uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	DisplayName          string    `gorm:"size:100" json:"display_name"`
	AvatarURL            string    `gorm:"size:500" json:"avatar_url"`
	TotalPoints          int       `gorm:"default:0" json:"total_points"`
	PuzzlesCompleted     int       `gorm:"default:0" json:"puzzles_completed"`
	CurrentStreak        int       `gorm:"default:0" json:"current_streak"`
	LongestStreak        int       `gorm:"default:0" json:"longest_streak"`
	LastPuzzleDate       *time.Time `json:"last_puzzle_date,omitempty"`
	
	// Music preferences
	MusicEnabled         bool      `gorm:"default:true" json:"music_enabled"`
	MusicVolume          int       `gorm:"default:70" json:"music_volume"` // 0-100
	
	// User preferences
	DifficultyPreference string    `gorm:"size:20;default:'beginner'" json:"difficulty_preference"` // beginner, intermediate, expert
	Theme                string    `gorm:"size:20;default:'dark'" json:"theme"` // dark, light
	
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for UserProfile model
func (UserProfile) TableName() string {
	return "user_profiles"
}

// BeforeCreate hook to create profile when user is created
func (u *User) AfterCreate(tx *gorm.DB) error {
	// Create default profile for new user
	profile := UserProfile{
		UserID:               u.ID,
		MusicEnabled:         true,
		MusicVolume:          70,
		DifficultyPreference: "beginner",
		Theme:                "dark",
	}
	return tx.Create(&profile).Error
}
