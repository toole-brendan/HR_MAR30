package com.example.handreceipt.data.model

import java.util.UUID

// Basic User model - add other fields (email, name, etc.) if needed/available from API
data class User(
    val id: UUID,
    val username: String
    // val firstName: String?,
    // val lastName: String?,
    // val email: String?
) 