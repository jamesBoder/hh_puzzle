package models

import "time"

// Purchase represents a puzzle pack purchase or subscription
type Purchase struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	UserID                uint       `gorm:"not null;index" json:"user_id"`
	PuzzlePackID          *uint      `gorm:"index" json:"puzzle_pack_id,omitempty"`
	
	// Payment details
	AmountUSD             float64    `gorm:"type:decimal(10,2);not null" json:"amount_usd"`
	Currency              string     `gorm:"size:3;default:'USD'" json:"currency"`
	PaymentProvider       string     `gorm:"size:50" json:"payment_provider,omitempty"` // stripe, apple, google
	TransactionID         string     `gorm:"size:255;uniqueIndex" json:"transaction_id,omitempty"`
	
	// Subscription details
	IsSubscription        bool       `gorm:"default:false;index" json:"is_subscription"`
	SubscriptionStartDate *time.Time `json:"subscription_start_date,omitempty"`
	SubscriptionEndDate   *time.Time `json:"subscription_end_date,omitempty"`
	SubscriptionStatus    string     `gorm:"size:50;index" json:"subscription_status,omitempty"` // active, cancelled, expired
	
	// Status
	Status                string     `gorm:"size:50;default:'pending'" json:"status"` // pending, completed, failed, refunded
	
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`

	// Relationships
	User       User        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	PuzzlePack *PuzzlePack `gorm:"foreignKey:PuzzlePackID;constraint:OnDelete:SET NULL" json:"puzzle_pack,omitempty"`
}

// TableName specifies the table name for Purchase model
func (Purchase) TableName() string {
	return "purchases"
}