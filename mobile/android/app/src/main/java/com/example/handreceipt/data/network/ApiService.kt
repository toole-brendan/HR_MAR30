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

    // --- Inventory / Property --- 

    // Get specific property details by serial number
    // Uses Response<Property> to handle 404 Not Found without throwing an exception
    // directly, allowing the ViewModel to manage that specific state.
    @GET("inventory/serial/{serialNumber}")
    suspend fun getPropertyBySerialNumber(
        @Path("serialNumber") serialNumber: String
        // TODO: Add authentication headers if needed
        // @Header("Authorization") token: String
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