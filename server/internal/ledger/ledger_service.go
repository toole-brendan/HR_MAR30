package ledger

import (
	"github.com/yourusername/handreceipt/internal/domain"
)

// LedgerService defines the interface for interacting with an immutable ledger.
// This allows for different implementations (e.g., QLDB, Azure SQL Ledger, Mock).
type LedgerService interface {
	// LogItemCreation logs an item creation event.
	LogItemCreation(property domain.Property, userID uint) error

	// LogTransferEvent logs a transfer event (creation or update).
	LogTransferEvent(transfer domain.Transfer, serialNumber string) error

	// LogStatusChange logs a status change event for an item.
	LogStatusChange(itemID uint, serialNumber string, oldStatus string, newStatus string, userID uint) error

	// LogVerificationEvent logs a verification event for an item.
	LogVerificationEvent(itemID uint, serialNumber string, userID uint, verificationType string) error

	// LogCorrectionEvent logs a correction event referencing a previous ledger event.
	LogCorrectionEvent(originalEventID string, eventType string, reason string, userID uint) error

	// GetItemHistory retrieves the history of an item based on its serial number.
	GetItemHistory(serialNumber string) ([]map[string]interface{}, error)

	// VerifyDocument checks the integrity of a ledger document (implementation specific).
	// For mock/development, this might always return true.
	// For Azure SQL Ledger, this would involve calling verification stored procedures/functions.
	VerifyDocument(documentID string, tableName string) (bool, error)

	// Initialize prepares the ledger service (e.g., connects, ensures tables/ledger exist).
	Initialize() error

	// Close cleans up resources used by the ledger service.
	Close() error
}
