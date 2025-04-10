package com.example.handreceipt.viewmodels

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.handreceipt.data.model.Transfer
import com.example.handreceipt.data.network.ApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject
import retrofit2.HttpException
import java.io.IOException
import java.util.UUID

sealed class TransfersUiState {
    object Loading : TransfersUiState()
    data class Success(val transfers: List<Transfer>) : TransfersUiState()
    data class Error(val message: String) : TransfersUiState()
}

// Optional: Add state for individual transfer actions
sealed class TransferActionState {
    object Idle : TransferActionState()
    object Loading : TransferActionState()
    data class Error(val message: String) : TransferActionState()
}

@HiltViewModel
class TransfersViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _transfersState = mutableStateOf<TransfersUiState>(TransfersUiState.Loading)
    val transfersState: State<TransfersUiState> = _transfersState

    // Add state for actions like approve/reject
    private val _actionState = mutableStateOf<TransferActionState>(TransferActionState.Idle)
    val actionState: State<TransferActionState> = _actionState

    // Filter States
    private val _directionFilter = mutableStateOf<String?>(null) // null = All, "incoming", "outgoing"
    val directionFilter: State<String?> = _directionFilter
    
    private val _statusFilter = mutableStateOf<String?>(null) // null = All, "PENDING", "HISTORY"
    val statusFilter: State<String?> = _statusFilter

    init {
        fetchTransfers() // Initial fetch
    }

    // Update filter and fetch
    fun setDirectionFilter(direction: String?) {
        if (_directionFilter.value != direction) {
            _directionFilter.value = direction
            fetchTransfers()
        }
    }
    
    fun setStatusFilter(status: String?) {
         if (_statusFilter.value != status) {
            _statusFilter.value = status
            fetchTransfers()
        }
    }

    // Fetch using current filter states
    private fun fetchTransfers() { 
        _transfersState.value = TransfersUiState.Loading
        _actionState.value = TransferActionState.Idle
        
        // Convert status filter "HISTORY" to API format if needed
         val statusQuery = when (_statusFilter.value) {
            "HISTORY" -> "APPROVED,REJECTED,CANCELLED" // Check backend compatibility
            else -> _statusFilter.value
        }
        
        viewModelScope.launch {
            try {
                // Use current filter values
                val response = apiService.getTransfers(status = statusQuery, direction = _directionFilter.value)
                if (response.isSuccessful && response.body() != null) {
                    _transfersState.value = TransfersUiState.Success(response.body()!!)
                } else {
                    val errorBody = response.errorBody()?.string() ?: "Unknown error fetching transfers"
                    _transfersState.value = TransfersUiState.Error("Error ${response.code()}: $errorBody")
                }
            } catch (e: HttpException) {
                _transfersState.value = TransfersUiState.Error("Network error: ${e.message()}")
            } catch (e: IOException) {
                _transfersState.value = TransfersUiState.Error("Network connection error.")
            } catch (e: Exception) {
                _transfersState.value = TransfersUiState.Error("An unexpected error occurred: ${e.localizedMessage}")
            }
        }
    }

    fun approveTransferAction(transferId: String) {
         _actionState.value = TransferActionState.Loading
         viewModelScope.launch {
            try {
                // Validate UUID format if necessary before API call
                // UUID.fromString(transferId)
                val response = apiService.approveTransfer(transferId)
                if (response.isSuccessful) {
                     println("Transfer $transferId approved successfully.")
                     _actionState.value = TransferActionState.Idle 
                     fetchTransfers() // Refresh list with current filters
                 } else {
                     val errorBody = response.errorBody()?.string() ?: "Unknown error approving transfer"
                     println("Error approving transfer $transferId: ${response.code()} - $errorBody")
                     _actionState.value = TransferActionState.Error("Error ${response.code()}: Failed to approve")
                 }
             } catch (e: HttpException) {
                 println("Network error approving transfer $transferId: ${e.message()}")
                 _actionState.value = TransferActionState.Error("Network error: ${e.message()}")
             } catch (e: IOException) {
                 println("Connection error approving transfer $transferId: ${e.message}")
                 _actionState.value = TransferActionState.Error("Network connection error.")
             } catch (e: IllegalArgumentException) {
                 println("Invalid Transfer ID format: $transferId")
                 _actionState.value = TransferActionState.Error("Invalid Transfer ID.")
             } catch (e: Exception) {
                 println("Unexpected error approving transfer $transferId: ${e.localizedMessage}")
                 _actionState.value = TransferActionState.Error("An unexpected error occurred.")
             }
         }
    }

     fun rejectTransferAction(transferId: String) {
         _actionState.value = TransferActionState.Loading
          viewModelScope.launch {
            try {
                 val response = apiService.rejectTransfer(transferId)
                 if (response.isSuccessful) {
                     println("Transfer $transferId rejected successfully.")
                     _actionState.value = TransferActionState.Idle 
                     fetchTransfers() // Refresh list with current filters
                 } else {
                     val errorBody = response.errorBody()?.string() ?: "Unknown error rejecting transfer"
                     println("Error rejecting transfer $transferId: ${response.code()} - $errorBody")
                      _actionState.value = TransferActionState.Error("Error ${response.code()}: Failed to reject")
                 }
             } catch (e: HttpException) {
                 println("Network error rejecting transfer $transferId: ${e.message()}")
                 _actionState.value = TransferActionState.Error("Network error: ${e.message()}")
             } catch (e: IOException) {
                  println("Connection error rejecting transfer $transferId: ${e.message}")
                 _actionState.value = TransferActionState.Error("Network connection error.")
              } catch (e: IllegalArgumentException) {
                 println("Invalid Transfer ID format: $transferId")
                 _actionState.value = TransferActionState.Error("Invalid Transfer ID.")
             } catch (e: Exception) {
                  println("Unexpected error rejecting transfer $transferId: ${e.localizedMessage}")
                 _actionState.value = TransferActionState.Error("An unexpected error occurred.")
             }
         }
    }
    
    // TODO: Implement requestTransfer action later
} 