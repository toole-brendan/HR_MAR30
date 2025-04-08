package domain

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"` // Password is omitted from JSON responses
	Name      string    `json:"name" gorm:"not null"`
	Rank      string    `json:"rank" gorm:"not null"`
	CreatedAt time.Time `json:"createdAt" gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// InventoryItem represents an item in the inventory
type InventoryItem struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	Name           string     `json:"name" gorm:"not null"`
	SerialNumber   string     `json:"serialNumber" gorm:"uniqueIndex;not null"`
	Description    *string    `json:"description" gorm:"default:null"`
	Category       *string    `json:"category" gorm:"default:null"`
	Status         string     `json:"status" gorm:"not null"`
	AssignedUserID *uint      `json:"assignedUserId" gorm:"default:null"`
	AssignedDate   *time.Time `json:"assignedDate" gorm:"default:null"`
	CreatedAt      time.Time  `json:"createdAt" gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// Transfer represents a transfer of an item between users
type Transfer struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	ItemID       uint       `json:"itemId" gorm:"not null"`
	FromUserID   uint       `json:"fromUserId" gorm:"not null"`
	ToUserID     uint       `json:"toUserId" gorm:"not null"`
	Status       string     `json:"status" gorm:"not null"`
	RequestDate  time.Time  `json:"requestDate" gorm:"not null;default:CURRENT_TIMESTAMP"`
	ResolvedDate *time.Time `json:"resolvedDate" gorm:"default:null"`
	Notes        *string    `json:"notes" gorm:"default:null"`
}

// Activity represents a system activity or event
type Activity struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	Type              string    `json:"type" gorm:"not null"`
	Description       string    `json:"description" gorm:"not null"`
	UserID            *uint     `json:"userId" gorm:"default:null"`
	RelatedItemID     *uint     `json:"relatedItemId" gorm:"default:null"`
	RelatedTransferID *uint     `json:"relatedTransferId" gorm:"default:null"`
	Timestamp         time.Time `json:"timestamp" gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// CreateUserInput represents input for creating a user
type CreateUserInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Rank     string `json:"rank" binding:"required"`
}

// CreateInventoryItemInput represents input for creating an inventory item
type CreateInventoryItemInput struct {
	Name           string  `json:"name" binding:"required"`
	SerialNumber   string  `json:"serialNumber" binding:"required"`
	Description    *string `json:"description"`
	Category       *string `json:"category"`
	Status         string  `json:"status" binding:"required"`
	AssignedUserID *uint   `json:"assignedUserId"`
}

// CreateTransferInput represents input for creating a transfer
type CreateTransferInput struct {
	ItemID     uint    `json:"itemId" binding:"required"`
	FromUserID uint    `json:"fromUserId" binding:"required"`
	ToUserID   uint    `json:"toUserId" binding:"required"`
	Status     string  `json:"status" binding:"required"`
	Notes      *string `json:"notes"`
}

// CreateActivityInput represents input for creating an activity
type CreateActivityInput struct {
	Type              string `json:"type" binding:"required"`
	Description       string `json:"description" binding:"required"`
	UserID            *uint  `json:"userId"`
	RelatedItemID     *uint  `json:"relatedItemId"`
	RelatedTransferID *uint  `json:"relatedTransferId"`
}

// LoginInput represents input for user login
type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// QLDB Models for immutable ledger

// QldbItemCreation represents an item creation event in QLDB
type QldbItemCreation struct {
	ID           string    `json:"id"`
	SerialNumber string    `json:"serialNumber"`
	Name         string    `json:"name"`
	Category     string    `json:"category"`
	UserID       uint      `json:"userId"`
	Timestamp    time.Time `json:"timestamp"`
}

// QldbTransferEvent represents a transfer event in QLDB
type QldbTransferEvent struct {
	ID           string    `json:"id"`
	ItemID       uint      `json:"itemId"`
	SerialNumber string    `json:"serialNumber"`
	FromUserID   uint      `json:"fromUserId"`
	ToUserID     uint      `json:"toUserId"`
	Status       string    `json:"status"`
	Timestamp    time.Time `json:"timestamp"`
}

// QldbStatusChange represents a status change event in QLDB
type QldbStatusChange struct {
	ID           string    `json:"id"`
	ItemID       uint      `json:"itemId"`
	SerialNumber string    `json:"serialNumber"`
	OldStatus    string    `json:"oldStatus"`
	NewStatus    string    `json:"newStatus"`
	UserID       uint      `json:"userId"`
	Timestamp    time.Time `json:"timestamp"`
}

// QldbVerificationEvent represents a verification event in QLDB
type QldbVerificationEvent struct {
	ID               string    `json:"id"`
	ItemID           uint      `json:"itemId"`
	SerialNumber     string    `json:"serialNumber"`
	VerifiedBy       uint      `json:"verifiedBy"`
	VerificationType string    `json:"verificationType"`
	Timestamp        time.Time `json:"timestamp"`
}

// QldbCorrectionEvent represents a correction event in QLDB
type QldbCorrectionEvent struct {
	ID              string    `json:"id"`
	OriginalEventID string    `json:"originalEventId"`
	EventType       string    `json:"eventType"`
	Reason          string    `json:"reason"`
	UserID          uint      `json:"userId"`
	Timestamp       time.Time `json:"timestamp"`
}
