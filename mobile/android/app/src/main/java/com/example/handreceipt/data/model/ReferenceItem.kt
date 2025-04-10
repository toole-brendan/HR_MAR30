package com.example.handreceipt.data.model

import com.google.gson.annotations.SerializedName // Import if using Gson and names differ
import java.util.UUID // Import if using UUID

// Define the structure for an item in the Reference Database
// Adjust properties based on your actual backend API response
data class ReferenceItem(
    // Use @SerializedName if JSON key differs from variable name
    // @SerializedName("item_id")
    val id: UUID, // Assuming UUID, adjust if it's Int or String. Ensure Gson can handle it or use a TypeAdapter.
    val nsn: String, // National Stock Number
    val itemName: String,
    val description: String?,
    val manufacturer: String?,
    val imageUrl: String? // Optional URL for an image

    // Add other relevant fields like category, unit price, etc.
)

// Optional: Provide an example for previews or testing
fun getExampleReferenceItem(): ReferenceItem {
    return ReferenceItem(
        id = UUID.randomUUID(),
        nsn = "1234-00-123-4567",
        itemName = "Example Item (Android)",
        description = "This is a sample description for the Android example item.",
        manufacturer = "Example Android Corp",
        imageUrl = null
    )
} 