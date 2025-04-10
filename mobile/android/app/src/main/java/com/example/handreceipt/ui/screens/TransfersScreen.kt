package com.example.handreceipt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.handreceipt.viewmodels.TransfersViewModel
import com.example.handreceipt.viewmodels.TransfersUiState
import com.example.handreceipt.data.model.Transfer // Import Transfer model
import java.text.SimpleDateFormat
import java.util.* // For Date formatting

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransfersScreen(
    viewModel: TransfersViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit,
    onSelectTransfer: (String) -> Unit // Callback for selecting a transfer
) {
    val transfersState by viewModel.transfersState
    val directionFilter by viewModel.directionFilter
    val statusFilter by viewModel.statusFilter

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Transfers") },
                 navigationIcon = {
                     // Only show back button if needed (depends on how it's integrated)
                     // IconButton(onClick = onNavigateBack) {
                     //    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                     // }
                 },
                 actions = {
                    // TODO: Add filter/refresh buttons?
                    IconButton(onClick = { viewModel.fetchTransfers() }) { // Simple refresh
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                 }
            )
        }
    ) { paddingValues ->
        Column(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            // Filter Chips Row
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // --- Direction Filters --- 
                 Text("Direction:", modifier = Modifier.align(Alignment.CenterVertically))
                 FilterChip(selected = directionFilter == null, onClick = { viewModel.setDirectionFilter(null) }, label = { Text("All") })
                 FilterChip(selected = directionFilter == "incoming", onClick = { viewModel.setDirectionFilter("incoming") }, label = { Text("Incoming") })
                 FilterChip(selected = directionFilter == "outgoing", onClick = { viewModel.setDirectionFilter("outgoing") }, label = { Text("Outgoing") })
            }
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                 // --- Status Filters --- 
                 Text("Status:", modifier = Modifier.align(Alignment.CenterVertically))
                  FilterChip(selected = statusFilter == null, onClick = { viewModel.setStatusFilter(null) }, label = { Text("All") })
                  FilterChip(selected = statusFilter == "PENDING", onClick = { viewModel.setStatusFilter("PENDING") }, label = { Text("Pending") })
                  FilterChip(selected = statusFilter == "HISTORY", onClick = { viewModel.setStatusFilter("HISTORY") }, label = { Text("History") })
            }
            
            Divider() // Separate filters from list
            
            // List Content Box
            Box(modifier = Modifier.weight(1f)) { // Make list take remaining space
                when (transfersState) {
                    is TransfersUiState.Loading -> {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                    }
                    is TransfersUiState.Success -> {
                        val transfers = (transfersState as TransfersUiState.Success).transfers
                        if (transfers.isEmpty()) {
                             Text("No transfers found matching filters.", modifier = Modifier.align(Alignment.Center).padding(16.dp))
                        } else {
                            LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp)) {
                                items(transfers, key = { it.id }) { transfer ->
                                    TransferListItem(transfer = transfer, onSelectTransfer = onSelectTransfer)
                                    Divider()
                                }
                            }
                        }
                    }
                    is TransfersUiState.Error -> {
                        Text(
                            "Error: ${(transfersState as TransfersUiState.Error).message}",
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.align(Alignment.Center).padding(16.dp)
                        )
                    }
                }
            }
        }
        // TODO: Add FAB to initiate a new transfer?
    }
}

// SimpleDateFormat is not locale-aware, consider alternatives for production
private val dateFormatter = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.US)

@Composable
fun TransferListItem(
    transfer: Transfer,
    onSelectTransfer: (String) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
           // .clickable { onSelectTransfer(transfer.id.toString()) }, // Make clickable
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                     "Item: ${transfer.propertyName ?: transfer.propertySerialNumber}",
                     style = MaterialTheme.typography.titleMedium
                )
                 Text("SN: ${transfer.propertySerialNumber}")
                 Spacer(modifier = Modifier.height(4.dp))
                 Text("From: ${transfer.fromUser?.username ?: transfer.fromUserId.toString().take(8)}")
                 Text("To: ${transfer.toUser?.username ?: transfer.toUserId.toString().take(8)}")
                 Text("Requested: ${dateFormatter.format(transfer.requestTimestamp)}")
                if (transfer.approvalTimestamp != null) {
                     Text("Approved: ${dateFormatter.format(transfer.approvalTimestamp)}")
                 }
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(transfer.status.name, style = MaterialTheme.typography.bodySmall)
            // TODO: Add approve/reject buttons directly here for PENDING items if needed?
        }
    }
} 