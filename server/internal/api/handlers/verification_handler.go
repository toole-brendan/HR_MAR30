package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/handreceipt/internal/ledger"
)

// VerificationHandler handles ledger verification operations
type VerificationHandler struct {
	Ledger ledger.LedgerService
}

// NewVerificationHandler creates a new verification handler
func NewVerificationHandler(ledgerService ledger.LedgerService) *VerificationHandler {
	return &VerificationHandler{Ledger: ledgerService}
}

// CheckLedgerStatus performs a basic health check on the ledger
func (h *VerificationHandler) CheckLedgerStatus(c *gin.Context) {
	// We don't need specific document/table info for this basic check yet
	// In a full implementation, these might come from the request
	documentID := "N/A"
	tableName := "N/A"

	ok, err := h.Ledger.VerifyDocument(documentID, tableName)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Ledger verification check failed",
			"error":   err.Error(),
		})
		return
	}

	if !ok {
		// VerifyDocument should return an error if not OK, but double-check
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":  "unhealthy",
			"message": "Ledger is not active or verification failed.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Ledger status check successful.",
	})
}
