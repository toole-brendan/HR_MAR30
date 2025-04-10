package com.example.handreceipt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.handreceipt.data.model.Property // Import correct model
import com.example.handreceipt.viewmodels.ManualSNViewModel // Import correct ViewModel
import com.example.handreceipt.viewmodels.PropertyLookupUiState // Import correct UI state
import java.text.SimpleDateFormat
import java.util.Locale

// REMOVE Placeholder Service, Errors, ViewModel
// object APIService { ... } // REMOVED
// sealed class APIError(...) // REMOVED
// class ManualSNViewModel : ViewModel() { ... } // REMOVED

@OptIn(ExperimentalMaterial3Api::class) // For Scaffold, TopAppBar etc.
@Composable
fun ManualSNEntryScreen(
    // Inject ViewModel (e.g., using Hilt)
    viewModel: ManualSNViewModel = viewModel(),
    // Callback when item is confirmed
    onItemConfirmed: (Property) -> Unit,
    onNavigateBack: () -> Unit // For back navigation
) {
    val serialNumberInput by viewModel.serialNumberInput.collectAsStateWithLifecycle()
    val lookupState by viewModel.lookupUiState.collectAsStateWithLifecycle()
    val focusManager = LocalFocusManager.current
    var showConfirmDialog by remember { mutableStateOf(false) }
    var itemToConfirm by remember { mutableStateOf<Property?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Manual SN Entry") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .fillMaxSize()
                // Make the column scrollable in case content overflows
                .verticalScroll(rememberScrollState()), 
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            
            // --- Input Field --- 
            OutlinedTextField(
                value = serialNumberInput,
                onValueChange = { viewModel.onSerialNumberChange(it) },
                label = { Text("Enter Serial Number") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.Characters,
                    imeAction = ImeAction.Search // Show search icon on keyboard
                ),
                keyboardActions = KeyboardActions(
                    onSearch = {
                         // Trigger lookup and hide keyboard on search action
                        // Debounce will handle the actual API call trigger
                        focusManager.clearFocus()
                    }
                ),
                 // Trailing icon to clear text
                trailingIcon = {
                     if (serialNumberInput.isNotEmpty()) {
                        IconButton(onClick = { viewModel.clearAndReset() }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear Text")
                        }
                    }
                }
            )

            // --- Status/Result Area --- 
             Box(
                 modifier = Modifier
                     .fillMaxWidth()
                     .defaultMinSize(minHeight = 150.dp) // Ensure minimum height
                     .padding(top = 8.dp), // Add some space above this box
                contentAlignment = Alignment.Center
             ) {
                 when (val state = lookupState) {
                    is PropertyLookupUiState.Idle -> {
                         Text(
                             text = "Enter a serial number to look up item details.",
                             style = MaterialTheme.typography.bodyMedium,
                             color = Color.Gray,
                             textAlign = TextAlign.Center,
                             modifier = Modifier.padding(16.dp)
                         )
                    }
                    is PropertyLookupUiState.Loading -> {
                        CircularProgressIndicator()
                    }
                    is PropertyLookupUiState.Success -> {
                         PropertyFoundCard(
                            property = state.property,
                            onConfirmClick = {
                                itemToConfirm = state.property
                                showConfirmDialog = true
                            }
                        )
                    }
                    is PropertyLookupUiState.NotFound -> {
                        ErrorStateView(message = "Serial number '$serialNumberInput' not found.", isWarning = true)
                    }
                    is PropertyLookupUiState.Error -> {
                         ErrorStateView(
                             message = state.message,
                             onRetry = { 
                                 // Re-trigger search manually on retry button click
                                viewModel.onSerialNumberChange(serialNumberInput) 
                                focusManager.clearFocus()
                             }
                         )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f)) // Push content towards top
        }
    }

    // Confirmation Dialog
    if (showConfirmDialog) {
        itemToConfirm?.let { propertyToConfirm ->
            AlertDialog(
                onDismissRequest = { showConfirmDialog = false },
                title = { Text("Confirm Action") },
                text = {
                    Text("Proceed with action for " +
                         "\"${propertyToConfirm.itemName}\" " +
                         "(SN: ${propertyToConfirm.serialNumber})?")
                },
                confirmButton = {
                    Button(
                        onClick = {
                            onItemConfirmed(propertyToConfirm)
                            showConfirmDialog = false
                        }
                    ) { Text("Confirm") }
                },
                dismissButton = {
                    Button(onClick = { showConfirmDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

// --- Composable for displaying the found property in a Card --- 
@Composable
fun PropertyFoundCard(
    property: Property,
    onConfirmClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Item Found", style = MaterialTheme.typography.titleMedium)
            Divider()

            PropertyDetailRow(label = "Name:", value = property.itemName)
            PropertyDetailRow(label = "Serial #:", value = property.serialNumber)
            PropertyDetailRow(label = "NSN:", value = property.nsn)
            PropertyDetailRow(label = "Status:", value = property.status)
            PropertyDetailRow(label = "Location:", value = property.location ?: "N/A")

            property.notes?.takeIf { it.isNotBlank() }?.let {
                PropertyDetailRow(label = "Notes:", value = it)
            }
            
            val assignedText = property.assignedToUserId?.toString()?.let { "User ID: $it" } ?: "Unassigned"
            PropertyDetailRow(label = "Assigned:", value = assignedText)

            // Format and display dates
            val dateFormatter = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
            property.lastInventoryDate?.let {
                 PropertyDetailRow(label = "Last Inv:", value = dateFormatter.format(it))
            }
             property.acquisitionDate?.let {
                 PropertyDetailRow(label = "Acquired:", value = dateFormatter.format(it))
            }

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = onConfirmClick,
                modifier = Modifier.align(Alignment.End)
            ) {
                Text("Confirm & Proceed")
            }
        }
    }
}

// Helper composable for consistent label-value rows
@Composable
fun PropertyDetailRow(label: String, value: String) {
     Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
            modifier = Modifier.width(100.dp) // Fixed width for alignment
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

// --- Composable for displaying Error/Not Found states --- 
@Composable
fun ErrorStateView(
    message: String,
    isWarning: Boolean = false, // Use orange for 'Not Found'
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Warning, 
            contentDescription = if (isWarning) "Warning" else "Error",
            tint = if (isWarning) Color(0xFFFFA726) else MaterialTheme.colorScheme.error,
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = message,
            color = if (isWarning) Color.Black else MaterialTheme.colorScheme.error,
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.bodyLarge
        )
        onRetry?.let {
             Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = it) {
                Text("Retry")
            }
        }
    }
}

// --- Previews --- 
// Add Previews if desired, requires providing mock data or ViewModel setup.
/*
@Preview(showBackground = true, name = "Idle State")
@Composable
fun ManualSNEntryScreenIdlePreview() {
    // Needs Theme wrapper
    ManualSNEntryScreen(onItemConfirmed = {}, onNavigateBack = {})
}

@Preview(showBackground = true, name = "Item Found")
@Composable
fun ManualSNEntryScreenFoundPreview() {
    // This preview is tricky because it relies on ViewModel state.
    // Consider creating a preview specifically for PropertyFoundCard:
    PropertyFoundCard(property = getExampleProperty(), onConfirmClick = {})
}

@Preview(showBackground = true, name = "Not Found")
@Composable
fun ManualSNEntryScreenNotFoundPreview() {
    ErrorStateView(message = "Serial number 'XYZ' not found.", isWarning = true)
}

@Preview(showBackground = true, name = "Error State")
@Composable
fun ManualSNEntryScreenErrorPreview() {
    ErrorStateView(message = "Network connection failed.", onRetry = {})
}
*/ 