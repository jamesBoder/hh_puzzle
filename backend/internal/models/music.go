package models

import "time"

// MusicTrack represents background music for the game
type MusicTrack struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Title           string    `gorm:"size:200;not null" json:"title"`
	Artist          string    `gorm:"size:200" json:"artist,omitempty"`
	
	// File information
	FileURL         string    `gorm:"size:500;not null" json:"file_url"`
	FileSizeKB      *int      `json:"file_size_kb,omitempty"`
	DurationSeconds *int      `json:"duration_seconds,omitempty"`
	
	// Metadata
	Genre           string    `gorm:"size:50;default:'hip-hop'" json:"genre"`
	Mood            string    `gorm:"size:50;index" json:"mood,omitempty"` // chill, energetic, focused
	BPM             *int      `json:"bpm,omitempty"`
	
	// Usage
	IsActive        bool      `gorm:"default:true;index" json:"is_active"`
	PlayCount       int       `gorm:"default:0" json:"play_count"`
	
	CreatedAt       time.Time `json:"created_at"`
}

// TableName specifies the table name for MusicTrack model
func (MusicTrack) TableName() string {
	return "music_tracks"
}