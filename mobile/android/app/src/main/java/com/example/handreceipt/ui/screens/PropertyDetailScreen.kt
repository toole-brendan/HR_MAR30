package com.example.handreceipt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.handreceipt.data.model.Property
import com.example.handreceipt.viewmodels.PropertyDetailUiState
import com.example.handreceipt.viewmodels.PropertyDetailViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun PropertyDetailScreen(
    viewModel: PropertyDetailViewModel = hiltViewModel(),
    // Optional: Add callbacks for actions like starting transfer, maintenance etc.
    // onStartTransfer: (Property) -> Unit,
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Update title or perform actions when state changes (optional)
    LaunchedEffect(uiState) {
        // Can update Scaffold title here if needed, though Scaffold is external
    }

    Box(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        when (val state = uiState) {
            is PropertyDetailUiState.Loading -> {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            }
            is PropertyDetailUiState.Success -> {
                PropertyDetailContent(property = state.property)
            }
            is PropertyDetailUiState.Error -> {
                PropertyDetailErrorView(message = state.message, onRetry = viewModel::fetchPropertyDetails)
            }
        }
    }
}

@Composable
fun PropertyDetailContent(property: Property) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(property.itemName, style = MaterialTheme.typography.headlineMedium)
        Divider()

        PropertyInfoRow(label = "Serial Number", value = property.serialNumber)
        PropertyInfoRow(label = "NSN", value = property.nsn)
        PropertyInfoRow(label = "Status", value = property.status)
        PropertyInfoRow(label = "Location", value = property.location ?: "N/A")
        
        if (property.lastInventoryDate != null) {
            PropertyInfoRow(label = "Last Inventory", value = formatDate(property.lastInventoryDate))
        }
        if (property.acquisitionDate != null) {
            PropertyInfoRow(label = "Acquisition Date", value = formatDate(property.acquisitionDate))
        }
        if (property.assignedToUserId != null) {
             // TODO: Fetch User Name based on ID for display
            PropertyInfoRow(label = "Assigned To", value = "User ID: ${property.assignedToUserId}")
        }
        if (!property.notes.isNullOrBlank()) {
            PropertyInfoRow(label = "Notes", value = property.notes)
        }

        // TODO: Add buttons for actions (Transfer, Maintenance, View History etc.)
        Spacer(modifier = Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { /* TODO: Implement Transfer */ }) { Text("Initiate Transfer") }
            OutlinedButton(onClick = { /* TODO: View History */ }) { Text("View History") }
        }
    }
}

@Composable
fun PropertyInfoRow(label: String, value: String?) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "$label:",
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.width(120.dp) // Align labels
        )
        Text(
            text = value ?: "N/A",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

@Composable
fun PropertyDetailErrorView(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Filled.ErrorOutline, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.error)
        Spacer(modifier = Modifier.height(16.dp))
        Text("Error Loading Property", style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(8.dp))
        Text(message, style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text("Retry")
        }
    }
}

// Duplicated from MyPropertiesScreen - consider moving to a common util file
private fun formatDate(date: Date): String {
    val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
    return formatter.format(date)
} 