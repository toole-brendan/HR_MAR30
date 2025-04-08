package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/handreceipt/internal/ledger"
)

// CorrectionHandler handles correction event logging operations
type CorrectionHandler struct {
	Ledger ledger.LedgerService
}

// NewCorrectionHandler creates a new correction handler
func NewCorrectionHandler(ledgerService ledger.LedgerService) *CorrectionHandler {
	return &CorrectionHandler{Ledger: ledgerService}
}

// CreateCorrection logs a correction event to the Ledger
func (h *CorrectionHandler) CreateCorrection(c *gin.Context) {
	var input struct {
		OriginalEventID string `json:"originalEventId" binding:"required"`
		EventType       string `json:"eventType" binding:"required"` // e.g., "ItemCreation", "TransferEvent", "StatusChange"
		Reason          string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
		return
	}

	// Get user ID from context (representing the user logging the correction)
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	userID, ok := userIDVal.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format in context"})
		return
	}

	// Log the correction event to Ledger Service
	errLedger := h.Ledger.LogCorrectionEvent(input.OriginalEventID, input.EventType, input.Reason, userID)
	if errLedger != nil {
		log.Printf("ERROR: Failed to log correction event (OriginalID: %s, Type: %s) to Ledger: %v", input.OriginalEventID, input.EventType, errLedger)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log correction event to ledger"})
		return
	}

	// TODO: Implement logic to potentially flag or update related records in PostgreSQL
	// based on the OriginalEventID and EventType. This requires more complex lookup.
	log.Printf("Successfully logged correction request for OriginalEventID: %s, Type: %s", input.OriginalEventID, input.EventType)

	c.JSON(http.StatusCreated, gin.H{
		"message":         "Correction event logged successfully to ledger.",
		"originalEventId": input.OriginalEventID,
		"eventType":       input.EventType,
	})
}
