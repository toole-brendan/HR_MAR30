package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"github.com/yourusername/handreceipt/internal/api/routes"
	"github.com/yourusername/handreceipt/internal/ledger"
	"github.com/yourusername/handreceipt/internal/platform/database"
)

func main() {
	// Setup configuration
	if err := setupConfig(); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Debug configuration values
	dbName := viper.GetString("database.name")
	dbUser := viper.GetString("database.user")
	dbHost := viper.GetString("database.host")
	log.Printf("Database config: name=%s, user=%s, host=%s", dbName, dbUser, dbHost)

	// Setup environment
	environment := viper.GetString("server.environment")
	if environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to database
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Create default user if needed
	if err := database.CreateDefaultUser(db); err != nil {
		log.Fatalf("Failed to create default user: %v", err)
	}

	// Initialize Ledger Service (Using Mock for now)
	var ledgerService ledger.LedgerService
	// TODO: Add logic here to switch between Mock and Azure SQL implementation based on config/env
	ledgerService = ledger.NewMockLedgerService()
	if err := ledgerService.Initialize(); err != nil {
		log.Fatalf("Failed to initialize Ledger service: %v", err)
	}
	// Ensure Close is called on shutdown (using defer in main is tricky, consider signal handling)
	// defer ledgerService.Close()

	// Create Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(corsMiddleware())

	// Setup routes, passing the LedgerService interface
	routes.SetupRoutes(router, ledgerService)

	// Get server port from config
	port := viper.GetInt("server.port")
	if port == 0 {
		port = 8000 // Default port changed to 8000 as per config
	}

	// Start server
	serverAddr := fmt.Sprintf(":%d", port)
	log.Printf("Starting server on %s (environment: %s)", serverAddr, environment)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// setupConfig loads application configuration from config.yaml
func setupConfig() error {
	// Set configuration name
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")

	// Get executable path
	execPath, err := os.Executable()
	if err != nil {
		log.Printf("Warning: Could not get executable path: %v", err)
		execPath = "."
	}

	// Config can be in multiple locations, check them in order
	viper.AddConfigPath(".")                                   // Current directory
	viper.AddConfigPath("./configs")                           // Configuration directory in current directory
	viper.AddConfigPath(filepath.Join(execPath, ".."))         // Parent directory of executable
	viper.AddConfigPath(filepath.Join(execPath, "../configs")) // Configuration directory in parent of executable
	viper.AddConfigPath("/etc/handreceipt")                    // System directory

	// Set environment variable prefix
	viper.SetEnvPrefix("HANDRECEIPT")
	viper.AutomaticEnv() // Automatically use all environment variables

	// Read configuration
	if err := viper.ReadInConfig(); err != nil {
		// It's only an error if no configuration is found
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("Warning: No configuration file found. Using default values and environment variables.")
			return nil
		}
		return fmt.Errorf("error reading config file: %w", err)
	}

	log.Printf("Using config file: %s", viper.ConfigFileUsed())
	return nil
}

// corsMiddleware adds CORS headers to responses
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", c.Request.Header.Get("Origin"))
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
