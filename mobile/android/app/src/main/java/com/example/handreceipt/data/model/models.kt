package com.example.handreceipt.data.model

import java.util.Date
import java.util.UUID

// Authentication Models
data class LoginRequest(val username: String, val password: String)
data class LoginResponse(val message: String, val user: User) // Assuming user details are returned on login
data class User(
    val id: UUID,
    val username: String,
    val rank: String?,
    val firstName: String?,
    val lastName: String?,
    val role: String? // e.g., "Commander", "Soldier"
)

// Reference Database Model
data class ReferenceItem(
    val nsn: String,
    val lin: String?,
    val itemName: String,
    val itemDescription: String?,
    val manufacturer: String?,
    val partNumber: String?,
    val unitOfIssue: String?,
    val price: Double?,
    val category: String?,
    val imageUrl: String?
)

// Property/Inventory Model
data class Property(
    val id: UUID,
    val serialNumber: String,
    val nsn: String,
    val status: String, // e.g., "Available", "Assigned", "Maintenance"
    val location: String?,
    val assignedToUserId: UUID?,
    val referenceItem: ReferenceItem? = null // Optionally populated by backend join
)


// --- Transfer Models --- 

data class UserSummary(
    val id: UUID,
    val username: String,
    val rank: String?,
    val lastName: String?
)

enum class TransferStatus {
    PENDING, APPROVED, REJECTED, CANCELLED
}

data class Transfer(
    val id: UUID,
    val propertyId: UUID,
    val propertySerialNumber: String, // Include for easy display
    val propertyName: String?, // Include for easy display (from reference)
    val fromUserId: UUID,
    val toUserId: UUID,
    val status: TransferStatus,
    val requestTimestamp: Date,
    val approvalTimestamp: Date?,
    val fromUser: UserSummary? = null, // Optionally populated
    val toUser: UserSummary? = null // Optionally populated
)

// Model for initiating a transfer request
data class TransferRequest(
    val propertyId: UUID, 
    val targetUserId: UUID
    // Could potentially use serialNumber instead of propertyId if backend supports it
)

// Model for approving/rejecting a transfer (if backend requires a body)
// data class TransferActionRequest(
//    val decision: String // e.g., "APPROVE" or "REJECT"
// ) 