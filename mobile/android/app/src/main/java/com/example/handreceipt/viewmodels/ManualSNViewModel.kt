package com.example.handreceipt.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.handreceipt.data.model.Property
import com.example.handreceipt.data.network.ApiService
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.util.concurrent.TimeUnit

// Sealed interface to represent the UI state for property lookup
sealed interface PropertyLookupUiState {
    object Idle : PropertyLookupUiState
    object Loading : PropertyLookupUiState
    data class Success(val property: Property) : PropertyLookupUiState
    object NotFound : PropertyLookupUiState
    data class Error(val message: String) : PropertyLookupUiState
}

@OptIn(FlowPreview::class) // For debounce
class ManualSNViewModel : ViewModel() {

    // --- State Management --- 

    // MutableStateFlow for the serial number input text
    private val _serialNumberInput = MutableStateFlow("")
    val serialNumberInput: StateFlow<String> = _serialNumberInput.asStateFlow()

    // Private mutable state flow for the lookup result
    private val _lookupUiState = MutableStateFlow<PropertyLookupUiState>(PropertyLookupUiState.Idle)
    // Public immutable state flow for the UI to observe
    val lookupUiState: StateFlow<PropertyLookupUiState> = _lookupUiState.asStateFlow()

    // --- Dependencies --- 

    // Use the ApiService instance provided by the ReferenceDbViewModel's companion object
    // TODO: Replace this with proper Dependency Injection (Hilt/Koin)
    private val service: ApiService = ReferenceDbViewModel.apiService 

    // --- Initialization & Logic --- 

    init {
        observeSerialNumberInput()
    }

    // Observe the serial number input with debounce
    private fun observeSerialNumberInput() {
        viewModelScope.launch {
            _serialNumberInput
                 // Don't search immediately, wait for user to pause typing
                .debounce(500L) // 500 milliseconds debounce
                 // Only proceed if the text actually changed
                .distinctUntilChanged()
                 // Don't search for empty/blank strings
                .filter { it.isNotBlank() }
                .collect { serialNumber ->
                    findProperty(serialNumber)
                }
        }
        // Also reset state if input becomes blank
         viewModelScope.launch {
             _serialNumberInput
                 .filter { it.isBlank() }
                .collect { 
                    // Only reset if not already idle
                    if (_lookupUiState.value != PropertyLookupUiState.Idle) {
                         _lookupUiState.value = PropertyLookupUiState.Idle
                         println("Input cleared, state reset to Idle")
                     }
                 }
         }
    }

    // Function called by UI to update the serial number input
    fun onSerialNumberChange(input: String) {
        _serialNumberInput.value = input
    }

    // Function to initiate the property lookup (called by debounce collector)
    private fun findProperty(serialNumber: String) {
        // Trim whitespace just in case, though filter should handle blanks
        val serialToSearch = serialNumber.trim()
        if (serialToSearch.isEmpty()) return

        _lookupUiState.value = PropertyLookupUiState.Loading
        println("Attempting to find property with SN: $serialToSearch")

        viewModelScope.launch {
            try {
                 // Use the shared service instance
                val response = service.getPropertyBySerialNumber(serialToSearch)

                if (response.isSuccessful) {
                    val property = response.body()
                    if (property != null) {
                        _lookupUiState.value = PropertyLookupUiState.Success(property)
                        println("Successfully found property: ${property.itemName}")
                    } else {
                        // Successful response but empty body - unexpected?
                         println("Server returned success but null body for SN: $serialToSearch")
                        _lookupUiState.value = PropertyLookupUiState.Error("Received empty response from server.")
                    }
                } else {
                     // Handle non-successful responses (like 404)
                    if (response.code() == 404) {
                         println("Property with SN $serialToSearch not found (404).")
                        _lookupUiState.value = PropertyLookupUiState.NotFound
                    } else {
                         // Handle other server errors
                         val errorBody = response.errorBody()?.string() ?: "Unknown server error"
                         println("Server error ${response.code()}: $errorBody")
                        _lookupUiState.value = PropertyLookupUiState.Error("Server error: ${response.code()}")
                    }
                }

            } catch (e: HttpException) {
                 // Error during HTTP exchange (rare if using Response<T> correctly)
                 println("HTTP Exception: ${e.message()}")
                 _lookupUiState.value = PropertyLookupUiState.Error("Network communication error.")
                 e.printStackTrace()
            } catch (e: Throwable) {
                 // Catch other errors (network connection, JSON parsing issues in GsonConverter, etc.)
                 println("Generic Throwable: ${e.message}")
                 _lookupUiState.value = PropertyLookupUiState.Error("An error occurred: ${e.message}")
                 e.printStackTrace()
            }
        }
    }

    // Function to manually clear the input and reset the state
    fun clearAndReset() {
        _serialNumberInput.value = ""
        // State will reset automatically via the filter collector
    }
} 