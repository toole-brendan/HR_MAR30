import Foundation

// ... existing Property model ...

// --- Transfer Models --- 

struct UserSummary: Codable, Identifiable, Hashable {
    let id: UUID
    let username: String
    let rank: String?
    let lastName: String?
}

enum TransferStatus: String, Codable, CaseIterable {
    case PENDING
    case APPROVED
    case REJECTED
    case CANCELLED
    // Add an unknown case for future-proofing or unexpected values
    case UNKNOWN
}

struct Transfer: Codable, Identifiable, Hashable {
    let id: UUID
    let propertyId: UUID
    let propertySerialNumber: String // Included for display
    let propertyName: String? // Included for display
    let fromUserId: UUID
    let toUserId: UUID
    let status: TransferStatus
    let requestTimestamp: Date
    let approvalTimestamp: Date?
    let fromUser: UserSummary? // Optionally populated
    let toUser: UserSummary? // Optionally populated
    
    // Custom initializer if backend status string needs mapping
    // Or handle in JSONDecoder configuration
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        propertyId = try container.decode(UUID.self, forKey: .propertyId)
        propertySerialNumber = try container.decode(String.self, forKey: .propertySerialNumber)
        propertyName = try container.decodeIfPresent(String.self, forKey: .propertyName)
        fromUserId = try container.decode(UUID.self, forKey: .fromUserId)
        toUserId = try container.decode(UUID.self, forKey: .toUserId)
        // Decode status safely, defaulting to UNKNOWN
        status = (try? container.decode(TransferStatus.self, forKey: .status)) ?? .UNKNOWN
        requestTimestamp = try container.decode(Date.self, forKey: .requestTimestamp)
        approvalTimestamp = try container.decodeIfPresent(Date.self, forKey: .approvalTimestamp)
        fromUser = try container.decodeIfPresent(UserSummary.self, forKey: .fromUser)
        toUser = try container.decodeIfPresent(UserSummary.self, forKey: .toUser)
    }
    
    // Add CodingKeys if property names differ from JSON keys (optional here if they match)
     private enum CodingKeys: String, CodingKey {
         case id, propertyId, propertySerialNumber, propertyName, fromUserId, toUserId, status, requestTimestamp, approvalTimestamp, fromUser, toUser
     }
}

// Model for initiating a transfer request
struct TransferRequest: Codable {
    let propertyId: UUID
    let targetUserId: UUID
}

// Model for approving/rejecting a transfer (if needed)
// struct TransferActionRequest: Codable {
//    let decision: String // e.g., "APPROVE"
// } 