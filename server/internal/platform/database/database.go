package database

import (
	"fmt"
	"log"

	"github.com/spf13/viper"
	"github.com/yourusername/handreceipt/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the database instance
var DB *gorm.DB

// GetConnectionString returns the database connection string
func GetConnectionString() string {
	host := viper.GetString("database.host")
	port := viper.GetInt("database.port")
	user := viper.GetString("database.user")
	password := viper.GetString("database.password")
	dbname := viper.GetString("database.name")
	sslMode := viper.GetString("database.ssl_mode")

	// Debug: Print out database configuration
	log.Printf("Database connection details: host=%s, port=%d, user=%s, dbname=%s, sslmode=%s",
		host, port, user, dbname, sslMode)

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslMode)
	log.Printf("Connection string: %s", connStr)

	return connStr
}

// Connect connects to the database
func Connect() (*gorm.DB, error) {
	host := viper.GetString("database.host")
	port := viper.GetInt("database.port")
	user := viper.GetString("database.user")
	password := viper.GetString("database.password")
	dbname := viper.GetString("database.name")
	sslMode := viper.GetString("database.ssl_mode")

	// Use direct DSN format
	dsn := fmt.Sprintf("postgresql://%s:%s@%s:%d/%s?sslmode=%s",
		user, password, host, port, dbname, sslMode)
	log.Printf("Using DSN: %s", dsn)

	// Create a custom logger config
	logConfig := logger.Config{
		SlowThreshold: 200,
		LogLevel:      logger.Info,
		Colorful:      true,
	}

	// Connect to the database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(log.Writer(), "\r\n", log.LstdFlags),
			logConfig,
		),
	})

	if err != nil {
		return nil, err
	}

	// Set global DB
	DB = db

	return db, nil
}

// Migrate runs auto migration for database models
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&domain.User{},
		&domain.Property{},
		&domain.Transfer{},
		&domain.Activity{},
	)
}

// CreateDefaultUser creates a default admin user if it doesn't exist
func CreateDefaultUser(db *gorm.DB) error {
	var count int64
	if err := db.Model(&domain.User{}).Count(&count).Error; err != nil {
		return err
	}

	// If there are no users, create a default admin user
	if count == 0 {
		defaultUser := domain.User{
			Username: "admin",
			// Note: This is NOT secure and is just for initial setup
			// In real code, you would hash this password
			Password: "$2b$10$xfTImAQbmP6d7S8JGSLDXeu0yDqLRQbYdJ4Jt.1J0C8vMnGJzPXOS", // "password"
			Name:     "Admin User",
			Rank:     "System Administrator",
		}

		result := db.Create(&defaultUser)
		if result.Error != nil {
			return result.Error
		}

		log.Println("Created default admin user")
	}

	return nil
}
