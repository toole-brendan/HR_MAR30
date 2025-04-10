package com.example.handreceipt.data.model

// --- Authentication Models --- 

// Data class for the login request body
data class LoginCredentials(
    val username: String,
    val password: String // Sent plain text over HTTPS
)

// Data class for the expected successful login response
// Adjust based on what your /api/auth/login endpoint actually returns
// It might return user details, roles, etc., or just a success status.
data class LoginResponse(
    val userId: Int, // Or String/UUID
    val username: String,
    val message: String // e.g., "Login successful"
    // Add other relevant user details returned on login (role, name, etc.)
)

// Data class for registration request (if needed)
/*
data class RegistrationDetails(
    val username: String,
    val password: String,
    val email: String? // Example other field
)
*/

// Data class for registration response (if needed)
/*
data class RegistrationResponse(
    val userId: Int,
    val message: String
)
*/ 