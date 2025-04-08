package handlers

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/yourusername/handreceipt/internal/api/middleware"
	"github.com/yourusername/handreceipt/internal/domain"
	"github.com/yourusername/handreceipt/internal/platform/database"
	"golang.org/x/crypto/bcrypt"
)

// AuthHandler handles authentication operations
type AuthHandler struct{}

// NewAuthHandler creates a new auth handler
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var loginInput domain.LoginInput

	// Validate request body
	if err := c.ShouldBindJSON(&loginInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// Find user by username
	var user domain.User
	result := database.DB.Where("username = ?", loginInput.Username).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare passwords
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginInput.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Store user ID in session for session-based auth (for frontend compatibility)
	session := sessions.Default(c)
	session.Set("userID", user.ID)
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	// Return user data and token matching the frontend expected format
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"rank":     user.Rank,
		},
	})
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var createUserInput domain.CreateUserInput

	// Validate request body
	if err := c.ShouldBindJSON(&createUserInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	// Check if username already exists
	var existingUser domain.User
	result := database.DB.Where("username = ?", createUserInput.Username).First(&existingUser)
	if result.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(createUserInput.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process request"})
		return
	}

	// Create user
	user := domain.User{
		Username: createUserInput.Username,
		Password: string(hashedPassword),
		Name:     createUserInput.Name,
		Rank:     createUserInput.Rank,
	}

	result = database.DB.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate token
	token, err := middleware.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return user data and token
	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"rank":     user.Rank,
		},
	})
}

// GetCurrentUser returns the currently authenticated user
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Retrieve user from database
	var user domain.User
	result := database.DB.First(&user, userID)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	// Return user data in the format expected by the frontend
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"rank":     user.Rank,
		},
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
