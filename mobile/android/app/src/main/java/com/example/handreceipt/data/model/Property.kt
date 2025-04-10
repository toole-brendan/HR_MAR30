package com.example.handreceipt.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date // For Date properties
import java.util.UUID

// Represents the detailed information for a specific property item,
// fetched by serial number or ID.
// Adjust properties and types based on your actual backend API response for the
// /api/inventory/serial/:serialNumber endpoint.
data class Property(
    // Ensure your Gson setup can handle UUIDs or change type to String/Int.
    val id: UUID,
    @SerializedName("serialNumber") // Explicit mapping example
    val serialNumber: String,
    val nsn: String,
    val itemName: String,
    val description: String?,
    val manufacturer: String?,
    val imageUrl: String?,
    val status: String, // Consider an Enum if statuses are fixed
    val assignedToUserId: Int?, // Or String/UUID
    val location: String?,
    // Ensure your Gson setup has a Date adapter (e.g., for ISO 8601)
    val lastInventoryDate: Date?,
    val acquisitionDate: Date?,
    val notes: String?
    // Add other relevant fields: condition, value, calibration_due_date, etc.
)

// Optional: Provide an example for previews or testing
fun getExampleProperty(): Property {
    return Property(
        id = UUID.randomUUID(),
        serialNumber = "SN987654321",
        nsn = "5820-01-523-1897",
        itemName = "AN/PRC-152 Radio (Android)",
        description = "Multiband Handheld Radio.",
        manufacturer = "Harris",
        imageUrl = null,
        status = "Operational",
        assignedToUserId = null,
        location = "Commo Closet",
        lastInventoryDate = Date(System.currentTimeMillis() - 86400000L * 15), // 15 days ago
        acquisitionDate = Date(System.currentTimeMillis() - 86400000L * 730), // 2 years ago
        notes = "Includes antenna and battery."
    )
} 