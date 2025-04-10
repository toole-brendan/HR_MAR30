import Foundation

// Define the structure for an item in the Reference Database
// Adjust properties based on your actual backend API response
struct ReferenceItem: Identifiable, Decodable {
    let id: UUID // Assuming UUID, adjust if it's Int or String
    let nsn: String // National Stock Number
    let itemName: String
    let description: String?
    let manufacturer: String?
    let imageUrl: String? // Optional URL for an image

    // Add other relevant fields like category, unit price, etc.

    // Example mapping if your API uses different key names (e.g., "item_name")
    /*
    enum CodingKeys: String, CodingKey {
        case id
        case nsn
        case itemName = "item_name"
        case description
        case manufacturer
        case imageUrl = "image_url"
    }
    */

    // Provide a default empty item for previews or placeholders
    static let example = ReferenceItem(
        id: UUID(),
        nsn: "1234-00-123-4567",
        itemName: "Example Item",
        description: "This is a sample description for the example item.",
        manufacturer: "Example Corp",
        imageUrl: nil
    )
} 