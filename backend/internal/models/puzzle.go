package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// JSONB is a custom type for PostgreSQL JSONB columns
type JSONB map[string]interface{}

// Value implements the driver.Valuer interface
func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface
func (j *JSONB) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &j)
}

// Puzzle represents a crossword puzzle
type Puzzle struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Title               string         `gorm:"size:200;not null" json:"title"`
	Description         string         `gorm:"type:text" json:"description"`
	
	// Grid data stored as JSONB
	GridData            JSONB          `gorm:"type:jsonb;not null" json:"grid_data"`
	CluesAcross         JSONB          `gorm:"type:jsonb;not null" json:"clues_across"`
	CluesDown           JSONB          `gorm:"type:jsonb;not null" json:"clues_down"`
	
	// Categorization
	Difficulty          string         `gorm:"size:20;not null;index" json:"difficulty"` // beginner, intermediate, expert
	Decade              string         `gorm:"size:10;index" json:"decade,omitempty"` // 80s, 90s, 2000s, 2010s, 2020s
	Region              string         `gorm:"size:50;index" json:"region,omitempty"` // NYC, LA, Atlanta, etc.
	Subgenre            string         `gorm:"size:50" json:"subgenre,omitempty"` // Trap, Boom Bap, etc.
	
	// Metadata
	EstimatedTime       int            `json:"estimated_time,omitempty"` // in minutes
	BasePoints          int            `gorm:"default:100" json:"base_points"`
	IsDailyChallenge    bool           `gorm:"default:false;index" json:"is_daily_challenge"`
	DailyChallengeDate  *time.Time     `gorm:"uniqueIndex" json:"daily_challenge_date,omitempty"`
	
	// Pack association
	PuzzlePackID        *uint          `gorm:"index" json:"puzzle_pack_id,omitempty"`
	
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	PuzzlePack   *PuzzlePack    `gorm:"foreignKey:PuzzlePackID;constraint:OnDelete:SET NULL" json:"puzzle_pack,omitempty"`
	Attempts     []PuzzleAttempt `gorm:"foreignKey:PuzzleID;constraint:OnDelete:CASCADE" json:"attempts,omitempty"`
}

// TableName specifies the table name for Puzzle model
func (Puzzle) TableName() string {
	return "puzzles"
}

// PuzzlePack represents a collection of puzzles for purchase
type PuzzlePack struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Name          string    `gorm:"size:200;not null" json:"name"`
	Description   string    `gorm:"type:text" json:"description"`
	
	// Categorization
	CategoryType  string    `gorm:"size:50;not null;index" json:"category_type"` // decade, region, subgenre, mixed
	CategoryValue string    `gorm:"size:50;index" json:"category_value,omitempty"` // 90s, NYC, Trap, etc.
	
	// Pricing
	PriceUSD      float64   `gorm:"type:decimal(10,2);not null" json:"price_usd"`
	IsSubscription bool     `gorm:"default:false" json:"is_subscription"`
	
	// Metadata
	PuzzleCount   int       `gorm:"default:0" json:"puzzle_count"`
	CoverImageURL string    `gorm:"size:500" json:"cover_image_url,omitempty"`
	IsActive      bool      `gorm:"default:true;index" json:"is_active"`
	
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relationships
	Puzzles   []Puzzle   `gorm:"foreignKey:PuzzlePackID" json:"puzzles,omitempty"`
	Purchases []Purchase `gorm:"foreignKey:PuzzlePackID;constraint:OnDelete:SET NULL" json:"purchases,omitempty"`
}

// TableName specifies the table name for PuzzlePack model
func (PuzzlePack) TableName() string {
	return "puzzle_packs"
}