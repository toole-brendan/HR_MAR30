import Foundation

// --- Authentication Models --- 

// Struct for the login request body
struct LoginCredentials: Encodable {
    let username: String
    let password: String // Sent plain text over HTTPS
}

// Struct for the expected successful login response
// Adjust based on what your /api/auth/login endpoint actually returns
struct LoginResponse: Decodable {
    let userId: Int // Or String/UUID
    let username: String
    let message: String // e.g., "Login successful"
    // Add other relevant user details returned on login (role, name, etc.)

    // Example CodingKeys if API names differ
    /*
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case username
        case message
    }
    */
}

// Define other auth-related structs (e.g., for registration) if needed 