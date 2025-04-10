package com.example.handreceipt.viewmodels

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.handreceipt.data.model.Property
import com.example.handreceipt.data.network.ApiService
import com.example.handreceipt.ui.navigation.Routes // Import Routes for arg key
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface PropertyDetailUiState {
    object Loading : PropertyDetailUiState
    data class Success(val property: Property) : PropertyDetailUiState
    data class Error(val message: String) : PropertyDetailUiState
}

@HiltViewModel
class PropertyDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val apiService: ApiService
) : ViewModel() {

    private val propertyId: String = checkNotNull(savedStateHandle[Routes.PropertyDetail.ARG_PROPERTY_ID])

    private val _uiState = MutableStateFlow<PropertyDetailUiState>(PropertyDetailUiState.Loading)
    val uiState: StateFlow<PropertyDetailUiState> = _uiState.asStateFlow()

    init {
        fetchPropertyDetails()
    }

    fun fetchPropertyDetails() {
        _uiState.value = PropertyDetailUiState.Loading
        viewModelScope.launch {
            try {
                println("PropertyDetailViewModel: Fetching details for property ID: $propertyId")
                val response = apiService.getPropertyById(propertyId)
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = PropertyDetailUiState.Success(response.body()!!)
                    println("PropertyDetailViewModel: Successfully fetched property: ${response.body()?.itemName}")
                } else {
                    val errorMsg = "Error fetching property details: ${response.code()} - ${response.message()}"
                    _uiState.value = PropertyDetailUiState.Error(errorMsg)
                    println("PropertyDetailViewModel: $errorMsg")
                    if (response.code() == 404) {
                        _uiState.value = PropertyDetailUiState.Error("Property not found.")
                    }
                }
            } catch (e: Exception) {
                val errorMsg = "Network or other error fetching property: ${e.message}"
                _uiState.value = PropertyDetailUiState.Error(errorMsg)
                println("PropertyDetailViewModel: $errorMsg")
                e.printStackTrace()
            }
        }
    }
} 