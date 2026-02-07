package models

import "time"

// OAuthAccount represents a linked OAuth account (Google, Apple)
type OAuthAccount struct {
ID             uint       `gorm:"primaryKey" json:"id"`
UserID         uint       `gorm:"not null;index" json:"user_id"`
Provider       string     `gorm:"size:50;not null" json:"provider"` // 'google', 'apple'
ProviderUserID string     `gorm:"size:255;not null" json:"provider_user_id"`
AccessToken    string     `gorm:"type:text" json:"-"` // Never send tokens in JSON
RefreshToken   string     `gorm:"type:text" json:"-"`
TokenExpiry    *time.Time `json:"-"`
CreatedAt      time.Time  `json:"created_at"`
UpdatedAt      time.Time  `json:"updated_at"`

// Relationships
User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for OAuthAccount model
func (OAuthAccount) TableName() string {
return "oauth_accounts"
}
