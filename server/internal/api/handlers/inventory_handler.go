package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"log"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/handreceipt/internal/domain"
	"github.com/yourusername/handreceipt/internal/ledger"
	"github.com/yourusername/handreceipt/internal/platform/database"
	"gorm.io/gorm"
)

// InventoryHandler handles inventory operations
type InventoryHandler struct {
	Ledger ledger.LedgerService
}

// NewInventoryHandler creates a new inventory handler
func NewInventoryHandler(ledgerService ledger.LedgerService) *InventoryHandler {
	return &InventoryHandler{Ledger: ledgerService}
}

// GetAllInventoryItems returns all inventory items
func (h *InventoryHandler) GetAllInventoryItems(c *gin.Context) {
	var items []domain.InventoryItem
	result := database.DB.Find(&items)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory items"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": items})
}

// GetInventoryItem returns a specific inventory item
func (h *InventoryHandler) GetInventoryItem(c *gin.Context) {
	// Parse ID from URL parameter
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Fetch item from database
	var item domain.InventoryItem
	result := database.DB.First(&item, uint(id))
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}

// CreateInventoryItem creates a new inventory item
func (h *InventoryHandler) CreateInventoryItem(c *gin.Context) {
	var input domain.CreateInventoryItemInput

	// Validate request body
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
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

	// Prepare the inventory item for database insertion
	item := domain.InventoryItem{
		Name:         input.Name,
		SerialNumber: input.SerialNumber,
		Description:  input.Description,
		Category:     input.Category,
		Status:       input.Status,
		// Assign user and date only if provided
	}
	if input.AssignedUserID != nil {
		item.AssignedUserID = input.AssignedUserID
		now := time.Now().UTC()
		item.AssignedDate = &now
	}

	// Insert into PostgreSQL database
	result := database.DB.Create(&item)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create inventory item: " + result.Error.Error()})
		return
	}

	// Log to Ledger Service
	errLedger := h.Ledger.LogItemCreation(item, userID)
	if errLedger != nil {
		// Log the error but don't fail the primary operation
		log.Printf("WARNING: Failed to log item creation (ID: %d, SN: %s) to Ledger: %v", item.ID, item.SerialNumber, errLedger)
	}

	c.JSON(http.StatusCreated, item)
}

// UpdateInventoryItemStatus updates the status of an inventory item
func (h *InventoryHandler) UpdateInventoryItemStatus(c *gin.Context) {
	// Parse ID from URL parameter
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Parse status from request body
	var updateData struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// Fetch item from database
	var item domain.InventoryItem
	result := database.DB.First(&item, uint(id))
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	// Store old status for logging
	oldStatus := item.Status

	// Update status
	item.Status = updateData.Status
	result = database.DB.Save(&item)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update inventory item status"})
		return
	}

	// Get user ID from context
	userIDVal, exists := c.Get("userID")
	if exists {
		userID, ok := userIDVal.(uint)
		if ok {
			// Log to Ledger Service
			errLedger := h.Ledger.LogStatusChange(item.ID, item.SerialNumber, oldStatus, updateData.Status, userID)
			if errLedger != nil {
				// Log error but don't fail the request
				log.Printf("WARNING: Failed to log status change (ItemID: %d, SN: %s) to Ledger: %v", item.ID, item.SerialNumber, errLedger)
				c.Writer.Write([]byte("\nWarning: Failed to log status update to immutable ledger")) // Optionally notify client
			}
		} else {
			log.Printf("WARNING: Could not assert userID to uint for ledger logging in UpdateInventoryItemStatus")
		}
	} else {
		log.Printf("WARNING: UserID not found in context for ledger logging in UpdateInventoryItemStatus")
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}

// GetInventoryItemsByUser returns inventory items assigned to a specific user
func (h *InventoryHandler) GetInventoryItemsByUser(c *gin.Context) {
	// Parse user ID from URL parameter
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Fetch items from database
	var items []domain.InventoryItem
	result := database.DB.Where("assigned_user_id = ?", uint(userID)).Find(&items)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory items"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": items})
}

// GetInventoryItemHistory returns the history of an inventory item from the Ledger
func (h *InventoryHandler) GetInventoryItemHistory(c *gin.Context) {
	// Parse serial number from URL parameter
	serialNumber := c.Param("serialNumber")

	// Get item history from Ledger Service
	history, err := h.Ledger.GetItemHistory(serialNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch item history from ledger"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"history": history})
}

// VerifyInventoryItem logs a verification event for an inventory item
func (h *InventoryHandler) VerifyInventoryItem(c *gin.Context) {
	// Parse ID from URL parameter
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Parse verification details from request body
	var verificationInput struct {
		VerificationType string `json:"verificationType" binding:"required"`
		// Add other relevant fields if needed, e.g., location, condition
	}

	if err := c.ShouldBindJSON(&verificationInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
		return
	}

	// Get user ID from context (representing the user performing the verification)
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

	// Fetch item from database to get serial number
	var item domain.InventoryItem
	result := database.DB.First(&item, uint(id))
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory item: " + result.Error.Error()})
		}
		return
	}

	// Log verification event to Ledger Service
	errLedger := h.Ledger.LogVerificationEvent(item.ID, item.SerialNumber, userID, verificationInput.VerificationType)
	if errLedger != nil {
		// Log error but don't necessarily fail the request, depending on requirements
		log.Printf("WARNING: Failed to log verification event (ItemID: %d, SN: %s, Type: %s) to Ledger: %v", item.ID, item.SerialNumber, verificationInput.VerificationType, errLedger)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log verification event to ledger"}) // Or return 200 with warning?
		return
	}

	log.Printf("Successfully logged verification event for ItemID: %d, SN: %s", item.ID, item.SerialNumber)
	c.JSON(http.StatusOK, gin.H{"message": "Verification event logged successfully"})
}
