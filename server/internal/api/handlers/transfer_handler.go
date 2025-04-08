package handlers

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/handreceipt/internal/domain"
	"github.com/yourusername/handreceipt/internal/ledger"
	"github.com/yourusername/handreceipt/internal/platform/database"
	"gorm.io/gorm"
)

// TransferHandler handles transfer operations
type TransferHandler struct {
	Ledger ledger.LedgerService
}

// NewTransferHandler creates a new transfer handler
func NewTransferHandler(ledgerService ledger.LedgerService) *TransferHandler {
	return &TransferHandler{Ledger: ledgerService}
}

// CreateTransfer creates a new transfer record
func (h *TransferHandler) CreateTransfer(c *gin.Context) {
	var input domain.CreateTransferInput

	// Validate request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	// This usually represents the user *initiating* the request, which might be the 'fromUser' or an admin
	requestingUserIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	_, ok := requestingUserIDVal.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format in context"})
		return
	}

	// Fetch the inventory item to get the serial number for Ledger logging
	var item domain.InventoryItem
	itemResult := database.DB.First(&item, input.ItemID)
	if itemResult.Error != nil {
		if errors.Is(itemResult.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory item: " + itemResult.Error.Error()})
		}
		return
	}

	// Prepare the transfer for database insertion
	transfer := domain.Transfer{
		ItemID:     input.ItemID,
		FromUserID: input.FromUserID,
		ToUserID:   input.ToUserID,
		Status:     input.Status, // Typically starts as 'pending' unless specified otherwise
		Notes:      input.Notes,
		// RequestDate defaults to CURRENT_TIMESTAMP in DB
		// ResolvedDate is null initially
	}

	// Insert into PostgreSQL database
	result := database.DB.Create(&transfer)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transfer: " + result.Error.Error()})
		return
	}

	// Log to Ledger Service
	errLedger := h.Ledger.LogTransferEvent(transfer, item.SerialNumber)
	if errLedger != nil {
		log.Printf("WARNING: Failed to log transfer creation (ID: %d, ItemID: %d, SN: %s) to Ledger after DB creation: %v", transfer.ID, transfer.ItemID, item.SerialNumber, errLedger)
		// Consider compensation logic here if ledger write fails, or at least alert
	} else {
		log.Printf("Successfully logged transfer creation (ID: %d, ItemID: %d) to Ledger", transfer.ID, transfer.ItemID)
	}

	c.JSON(http.StatusCreated, transfer)
}

// UpdateTransferStatus updates the status of a transfer
func (h *TransferHandler) UpdateTransferStatus(c *gin.Context) {
	// Parse ID from URL parameter
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Parse status from request body
	var updateData struct {
		Status string  `json:"status" binding:"required"`
		Notes  *string `json:"notes"` // Allow updating notes optionally
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
		return
	}

	// Validate status value (adjust allowed statuses as needed)
	allowedStatuses := map[string]bool{"pending": true, "approved": true, "rejected": true, "completed": true}
	if !allowedStatuses[updateData.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status value"})
		return
	}

	// Get user ID from context (representing the user performing the update)
	_, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	// TODO: Add authorization logic here - does this user (userIDVal) have permission to update this transfer?

	// Fetch transfer from database
	var transfer domain.Transfer
	result := database.DB.First(&transfer, uint(id))
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transfer not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transfer: " + result.Error.Error()})
		}
		return
	}

	// Fetch the related inventory item for serial number
	var item domain.InventoryItem
	itemResult := database.DB.First(&item, transfer.ItemID)
	if itemResult.Error != nil {
		log.Printf("Error fetching related item %d for transfer %d update: %v", transfer.ItemID, transfer.ID, itemResult.Error)
		// Decide if this is fatal - maybe proceed without Ledger logging? For now, fail.
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch related inventory item for logging"})
		return
	}

	// Update fields
	// oldStatus := transfer.Status // Keep track for logging if needed, though LogTransferEvent takes the whole object
	transfer.Status = updateData.Status
	if updateData.Notes != nil {
		transfer.Notes = updateData.Notes
	}

	// Update ResolvedDate based on status
	if transfer.Status == "approved" || transfer.Status == "rejected" || transfer.Status == "completed" {
		now := time.Now().UTC()
		transfer.ResolvedDate = &now
	} else {
		transfer.ResolvedDate = nil // Reset if moved back to pending
	}

	// Save updated transfer to PostgreSQL
	result = database.DB.Save(&transfer)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transfer status: " + result.Error.Error()})
		return
	}

	// Log the updated state to Ledger Service
	errLedger := h.Ledger.LogTransferEvent(transfer, item.SerialNumber)
	if errLedger != nil {
		// Log error but don't fail the request as DB update succeeded
		log.Printf("WARNING: Failed to log transfer status update (ID: %d, SN: %s, NewStatus: %s) to Ledger: %v", transfer.ID, item.SerialNumber, transfer.Status, errLedger)
		c.Writer.Write([]byte("\nWarning: Failed to log status update to immutable ledger")) // Optionally notify client
	} else {
		log.Printf("Successfully logged transfer status update (ID: %d, NewStatus: %s) to Ledger", transfer.ID, transfer.Status)
	}

	c.JSON(http.StatusOK, transfer)
}

// GetAllTransfers returns all transfers (Placeholder)
func (h *TransferHandler) GetAllTransfers(c *gin.Context) {
	// TODO: Implement logic to fetch all transfers, potentially with pagination
	var transfers []domain.Transfer
	result := database.DB.Order("request_date desc").Find(&transfers) // Example: Order by request date
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transfers: " + result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"transfers": transfers})
}

// GetTransferByID returns a specific transfer (Placeholder)
func (h *TransferHandler) GetTransferByID(c *gin.Context) {
	// TODO: Implement logic to parse ID and fetch transfer
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var transfer domain.Transfer
	result := database.DB.First(&transfer, uint(id))
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transfer not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transfer: " + result.Error.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"transfer": transfer})
}

// GetTransfersByUser returns transfers associated with a user (Placeholder)
func (h *TransferHandler) GetTransfersByUser(c *gin.Context) {
	// TODO: Implement logic to parse user ID and fetch relevant transfers (from/to)
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Fetch transfers where the user is either the sender or receiver
	var transfers []domain.Transfer
	result := database.DB.Where("from_user_id = ? OR to_user_id = ?", uint(userID), uint(userID)).Order("request_date desc").Find(&transfers)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transfers for user: " + result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"transfers": transfers})
}
