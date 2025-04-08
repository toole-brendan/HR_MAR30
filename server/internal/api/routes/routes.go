package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/yourusername/handreceipt/internal/api/handlers"
	"github.com/yourusername/handreceipt/internal/api/middleware"
	"github.com/yourusername/handreceipt/internal/ledger"
)

// SetupRoutes configures all the API routes for the application
func SetupRoutes(router *gin.Engine, ledgerService ledger.LedgerService) {
	// Initialize session middleware
	middleware.SetupSession(router)

	// Create handlers
	authHandler := handlers.NewAuthHandler()
	inventoryHandler := handlers.NewInventoryHandler(ledgerService)
	transferHandler := handlers.NewTransferHandler(ledgerService)
	activityHandler := handlers.NewActivityHandler() // No ledger needed
	verificationHandler := handlers.NewVerificationHandler(ledgerService)
	correctionHandler := handlers.NewCorrectionHandler(ledgerService)
	// ... more handlers will be added in the future

	// Public routes (no authentication required)
	public := router.Group("/api")
	{
		// Authentication
		auth := public.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/logout", authHandler.Logout)                                        // Added logout route
			auth.GET("/me", middleware.SessionAuthMiddleware(), authHandler.GetCurrentUser) // Use SessionAuthMiddleware
		}
	}

	// Protected routes (authentication required)
	// Use both JWT and session auth for flexibility
	protected := router.Group("/api")
	protected.Use(middleware.SessionAuthMiddleware())
	{
		// Current user route can now be removed as it's handled above

		// Inventory routes
		inventory := protected.Group("/inventory")
		{
			inventory.GET("", inventoryHandler.GetAllInventoryItems)
			inventory.GET("/:id", inventoryHandler.GetInventoryItem)
			inventory.POST("", inventoryHandler.CreateInventoryItem)
			inventory.PATCH("/:id/status", inventoryHandler.UpdateInventoryItemStatus)
			inventory.GET("/user/:userId", inventoryHandler.GetInventoryItemsByUser)
			inventory.GET("/history/:serialNumber", inventoryHandler.GetInventoryItemHistory)
			inventory.POST("/:id/verify", inventoryHandler.VerifyInventoryItem)
		}

		// Transfer routes
		transfer := protected.Group("/transfers")
		{
			transfer.POST("", transferHandler.CreateTransfer)
			transfer.PATCH("/:id/status", transferHandler.UpdateTransferStatus)
			transfer.GET("", transferHandler.GetAllTransfers)
			transfer.GET("/:id", transferHandler.GetTransferByID)
			transfer.GET("/user/:userId", transferHandler.GetTransfersByUser)
		}

		// Activity routes
		activity := protected.Group("/activities")
		{
			activity.POST("", activityHandler.CreateActivity)
			activity.GET("", activityHandler.GetAllActivities)
			activity.GET("/user/:userId", activityHandler.GetActivitiesByUserId)
		}

		// Verification routes (for checking ledger status/integrity)
		verification := protected.Group("/verification")
		{
			verification.GET("/status", verificationHandler.CheckLedgerStatus)
			// TODO: Add route for full cryptographic document verification
		}

		// Correction routes
		correction := protected.Group("/corrections")
		{
			correction.POST("", correctionHandler.CreateCorrection)
			// TODO: Add routes for querying/viewing correction events?
		}
	}
}
