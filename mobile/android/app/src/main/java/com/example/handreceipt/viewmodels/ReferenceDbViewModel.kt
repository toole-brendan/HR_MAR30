package com.example.handreceipt.viewmodels

import android.webkit.CookieManager // Import CookieManager
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.handreceipt.data.model.ReferenceItem
import com.example.handreceipt.data.network.ApiService
// import com.google.gson.GsonBuilder // Needed if using custom Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import okhttp3.CookieJar // Import CookieJar
import okhttp3.JavaNetCookieJar // Import JavaNetCookieJar
import okhttp3.OkHttpClient // Import OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor // Import Logging Interceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.CookieHandler // Import CookieHandler
import java.net.CookiePolicy // Import CookiePolicy
import java.util.UUID

// Sealed interface to represent the UI state
sealed interface ReferenceDbUiState {
    data class Success(val items: List<ReferenceItem>) : ReferenceDbUiState
    object Error : ReferenceDbUiState // Consider adding error message
    object Loading : ReferenceDbUiState
}

class ReferenceDbViewModel : ViewModel() {

    // Private mutable state flow
    private val _uiState = MutableStateFlow<ReferenceDbUiState>(ReferenceDbUiState.Loading)
    // Public immutable state flow for the UI to observe
    val uiState: StateFlow<ReferenceDbUiState> = _uiState.asStateFlow()

    // TODO: Replace with your actual base URL
    private val BASE_URL = "http://10.0.2.2:8080/api/"

    // --- Centralized Network Client Setup (Ideally done with DI like Hilt) ---
    companion object {
        // Configure OkHttpClient
        private val okHttpClient: OkHttpClient by lazy {
            // Setup system-wide cookie handler
             val cookieHandler = java.net.CookieManager() // Use java.net.CookieManager
            cookieHandler.setCookiePolicy(CookiePolicy.ACCEPT_ALL) // Or ACCEPT_ORIGINAL_SERVER
            CookieHandler.setDefault(cookieHandler)

            // Create Logging Interceptor
            val logging = HttpLoggingInterceptor().apply {
                 // Use Level.BODY for detailed logs during development
                 // Use Level.BASIC or Level.NONE for production
                 level = HttpLoggingInterceptor.Level.BODY // Or Level.HEADERS
            }

            OkHttpClient.Builder()
                 // Add the CookieJar to automatically handle cookies
                .cookieJar(JavaNetCookieJar(cookieHandler))
                 // Add Logging Interceptor (should be last network interceptor)
                .addInterceptor(logging)
                // Add other interceptors if needed (e.g., for adding auth tokens)
                .build()
        }

        // Configure Retrofit
        private val retrofit: Retrofit by lazy {
            // TODO: Configure Gson instance if needed for Date/UUID types
            // val gson = GsonBuilder()...create()

            Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(okHttpClient) // Use the configured OkHttpClient
                 // .addConverterFactory(GsonConverterFactory.create(gson))
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }

        // Provide ApiService instance
        val apiService: ApiService by lazy {
            retrofit.create(ApiService::class.java)
        }
    }
    // --- End Centralized Setup --- 

    // Use the ApiService instance provided by the companion object
    private val service = apiService 

    init {
        loadReferenceItems()
    }

    fun loadReferenceItems() {
        _uiState.update { ReferenceDbUiState.Loading }
        viewModelScope.launch {
            try {
                 // Fetch items using the configured service
                val items = service.getReferenceItems()
                _uiState.update { ReferenceDbUiState.Success(items) }
                println("Successfully fetched \\${items.size} reference items")
             } catch (e: Exception) {
                 _uiState.update { ReferenceDbUiState.Error }
                 println("Error loading reference items: \\${e.message}")
                e.printStackTrace()
            }
        }
    }

    // TODO: Implement other ViewModel functions as needed (e.g., search, authentication)
} 