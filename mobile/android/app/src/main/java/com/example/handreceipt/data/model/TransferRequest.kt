package com.example.handreceipt.data.model

import java.util.UUID // Assuming IDs are UUIDs, adjust if necessary

// Data class for the transfer request body
data class TransferRequest(
    val propertyId: UUID,
    val recipientUserId: UUID // Assuming recipient is identified by UUID
)

// Data class for a potential simple response (adjust as needed)
// data class TransferResponse(
//     val transferId: UUID,
//     val status: String
// ) 