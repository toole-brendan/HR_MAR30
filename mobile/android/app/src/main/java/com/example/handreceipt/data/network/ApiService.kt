package com.example.handreceipt.data.network

// Import Auth models
import com.example.handreceipt.data.model.LoginCredentials
import com.example.handreceipt.data.model.LoginResponse
import com.example.handreceipt.data.model.Property
import com.example.handreceipt.data.model.ReferenceItem
import retrofit2.Response
import retrofit2.http.Body // Import Body annotation
import retrofit2.http.GET
import retrofit2.http.POST // Import POST annotation
import retrofit2.http.Path
// import retrofit2.http.Header // Import if adding authentication headers

// Retrofit interface defining the API endpoints
interface ApiService {

    // --- Authentication --- 

    // Login endpoint
    // Expects LoginCredentials in the request body.
    // Returns Response<LoginResponse> to allow handling of non-200 status codes (e.g., 401 Unauthorized)
    @POST("auth/login")
    suspend fun login(
        @Body credentials: LoginCredentials
    ): Response<LoginResponse>

    // Check current session by fetching user profile
    @GET("users/me")
    suspend fun checkSession(): Response<LoginResponse> // Returns Response to handle 401 etc.

    // TODO: Add other auth endpoints like logout, register, check-session etc. if needed
    /*
    @POST("auth/logout")
    suspend fun logout(): Response<Unit> // Or some confirmation response
    
    @GET("users/me") // Example protected endpoint to check session
    suspend fun getCurrentUser(): Response<User> // Assuming a User model
    */

    // --- Reference Database --- 

    // Define the GET request to fetch reference items
    // The path should match the endpoint on your Go backend API
    // TODO: Update the endpoint path (e.g., "reference/items")
    @GET("reference-db/items") // Placeholder path
    suspend fun getReferenceItems(): List<ReferenceItem>

    // Get specific reference item details by ID
    // Uses Response<ReferenceItem> to handle 404 Not Found
    @GET("reference-db/items/{itemId}")
    suspend fun getReferenceItemById(
        @Path("itemId") itemId: String
        // TODO: Add authentication if needed
    ): Response<ReferenceItem>

    // --- Inventory / Property --- 

    // Get properties assigned to the current user
    @GET("users/me/inventory")
    suspend fun getMyInventory(): Response<List<Property>>

    // Get specific property details by its ID
    @GET("inventory/id/{propertyId}")
    suspend fun getPropertyById(
        @Path("propertyId") propertyId: String // Or UUID/Int
    ): Response<Property>

    // Get specific property details by serial number
    @GET("inventory/serial/{serialNumber}")
    suspend fun getPropertyBySerialNumber(
        @Path("serialNumber") serialNumber: String
    ): Response<Property>

    // Add other API functions here as needed
    /*
    @GET("reference-db/items/{nsn}")
    suspend fun getItemByNsn(
        @Path("nsn") nsn: String,
        // Example: Add authentication header if needed
        // @Header("Authorization") token: String
    ): ReferenceItem
    */

    /*
    @GET("inventory/id/{propertyId}")
    suspend fun getPropertyById(
        @Path("propertyId") propertyId: String // Or UUID/Int
    ): Response<Property>
    */
} 