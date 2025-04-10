import Foundation

// Represents the structure of a Property item fetched from the backend
// Conforms to Codable for JSON decoding and Identifiable for use in SwiftUI lists
struct Property: Codable, Identifiable {
    let id: UInt // Matches Go uint
    let propertyModelId: UInt? // Optional, matches Go *uint
    let name: String
    let serialNumber: String
    let description: String? // Optional, matches Go *string
    let currentStatus: String
    let assignedToUserId: UInt? // Optional, matches Go *uint
    // Dates are expected as ISO8601 strings from the Go backend JSON marshaller
    let lastVerifiedAt: String?
    let lastMaintenanceAt: String?
    let createdAt: String
    let updatedAt: String

    // Explicitly define coding keys to match the JSON keys from the Go backend API.
    // These should align with the `json:...` tags in the Go domain.Property struct.
    enum CodingKeys: String, CodingKey {
        case id
        case propertyModelId   // Check Go struct's json tag (likely this or property_model_id)
        case name
        case serialNumber
        case description
        case currentStatus
        case assignedToUserId  // Check Go struct's json tag (likely this or assigned_to_user_id)
        case lastVerifiedAt    // Check Go struct's json tag
        case lastMaintenanceAt // Check Go struct's json tag
        case createdAt         // Check Go struct's json tag
        case updatedAt         // Check Go struct's json tag
    }
}

// Placeholder ReferenceItem struct (potentially move to its own file)
// Needed because ManualSNViewModel used it previously.
// You might replace this or merge details with the Property struct later.
struct ReferenceItem: Identifiable {
    let id = UUID() // Using UUID temporarily
    let nsn: String
    let name: String
    let description: String
} 