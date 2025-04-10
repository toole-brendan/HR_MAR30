package com.example.handreceipt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.handreceipt.data.model.Transfer
import com.example.handreceipt.data.model.TransferStatus
import com.example.handreceipt.viewmodels.TransferActionState
import com.example.handreceipt.viewmodels.TransfersUiState
import com.example.handreceipt.viewmodels.TransfersViewModel
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransferDetailScreen(
    transferId: String,
    viewModel: TransfersViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit
) {
    val transfersState by viewModel.transfersState
    val actionState by viewModel.actionState
    
    // Find the specific transfer from the list state (simplistic approach)
    val transfer: Transfer? = remember(transfersState, transferId) {
        if (transfersState is TransfersUiState.Success) {
            try {
                 val uuid = UUID.fromString(transferId)
                (transfersState as TransfersUiState.Success).transfers.find { it.id == uuid }
            } catch (e: IllegalArgumentException) {
                null // Invalid UUID format
            }
        } else {
            null
        }
    }

    // Effect to navigate back when an action completes successfully
     LaunchedEffect(actionState) {
         if (actionState == TransferActionState.Idle && 
             (viewModel.transfersState.value is TransfersUiState.Loading || 
              /* Add condition if you want dismissal only after specific actions */ true )) {
             // Check if we were previously loading and are now idle (meaning success)
             // This logic might need refinement depending on exact state flow
             println("Action likely succeeded (state reset to Idle), navigating back.")
            // onNavigateBack() // FIXME: This dismisses too eagerly on initial load. Need better success signal.
         }
     }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Transfer # ${transferId.take(8)}...") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            if (transfer == null) {
                // Show loading indicator or error if transfer not found
                if (transfersState is TransfersUiState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                } else {
                    Text(
                        "Transfer details not found.", 
                         modifier = Modifier.align(Alignment.Center).padding(16.dp)
                    )
                }
            } else {
                // Display Transfer Details
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    // Reuse TransferListItem or create a dedicated detail layout
                    TransferListItem(transfer = transfer, onSelectTransfer = {}) // Pass empty lambda
                    
                    Spacer(modifier = Modifier.height(24.dp))
                    
                    // Action Buttons
                    if (transfer.status == TransferStatus.PENDING) {
                         // Display Action Error if any
                         if (actionState is TransferActionState.Error) {
                             Text(
                                 "Error: ${(actionState as TransferActionState.Error).message}", 
                                 color = MaterialTheme.colorScheme.error,
                                 modifier = Modifier.padding(bottom = 8.dp)
                            )
                         }
                         
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Button(
                                onClick = { viewModel.approveTransferAction(transferId) },
                                enabled = actionState != TransferActionState.Loading, // Disable during loading
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                            ) {
                                if (actionState == TransferActionState.Loading) {
                                     CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp, color = LocalContentColor.current)
                                } else {
                                     Text("Approve")
                                }
                            }
                            Button(
                                onClick = { viewModel.rejectTransferAction(transferId) },
                                enabled = actionState != TransferActionState.Loading, // Disable during loading
                                 colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                            ) {
                                 if (actionState == TransferActionState.Loading) {
                                     CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp, color = LocalContentColor.current)
                                 } else {
                                      Text("Reject")
                                 }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
} 