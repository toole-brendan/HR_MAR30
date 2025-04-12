import SwiftUI

struct PropertyDetailView: View {
    @StateObject private var viewModel: PropertyDetailViewModel
    
    @Environment(\.dismiss) var dismiss

    // Shared Date Formatter (Consider moving to a Utils file)
    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }

    init(propertyId: String) {
        _viewModel = StateObject(wrappedValue: PropertyDetailViewModel(propertyId: propertyId))
    }

    var body: some View {
        VStack(alignment: .leading) {
            switch viewModel.loadingState { // Switch on the new LoadingState enum
                case .idle, .loading:
                    ProgressView("Loading Details...") // Consistent message
                        .frame(maxWidth: .infinity, maxHeight: .infinity) // Center it
                case .success(let property):
                    PropertyDetailContent(property: property, viewModel: viewModel)
                case .error(let message):
                    // Use the reusable ErrorStateView from MyPropertiesView
                    ErrorStateView(message: message) {
                        viewModel.loadPropertyDetails() // Call the ViewModel's load function
                    }
            }
        }
        .navigationTitle(viewModel.property?.serialNumber ?? "Details")
         .navigationBarTitleDisplayMode(.inline)
         .toolbar { // Add actions to toolbar
             ToolbarItem(placement: .navigationBarTrailing) {
                 // Only show button if property is loaded and not currently trying to transfer
                 if viewModel.property != nil && viewModel.transferRequestState != .loading {
                    Button("Request Transfer") {
                         viewModel.requestTransferClicked()
                     }
                 }
             }
         }
         // Present User Selection Sheet
         .sheet(isPresented: $viewModel.showingUserSelection) {
             // Pass the callback to the ViewModel's initiateTransfer function
             UserSelectionView(onUserSelected: { selectedUser in
                 viewModel.initiateTransfer(targetUser: selectedUser)
             })
         }
         // Use ActionStatusOverlay for transfer state feedback
         .overlay(
             ActionStatusOverlay(state: viewModel.transferRequestState) // Use the shared overlay view
                .animation(.spring(), value: viewModel.transferRequestState) // Animate the overlay
         )
         .onAppear { // Load details when the view appears
             if viewModel.loadingState == .idle {
                 viewModel.loadPropertyDetails()
             }
         }
    }
}

// Extracted content view
struct PropertyDetailContent: View {
    let property: Property
    // Use @ObservedObject if actions need the VM instance directly
     @ObservedObject var viewModel: PropertyDetailViewModel 

    var body: some View {
        ScrollView { // Make content scrollable if it gets long
            VStack(alignment: .leading, spacing: 12) {
                 DetailRow(label: "Item Name", value: property.referenceItem?.itemName ?? "N/A")
                 DetailRow(label: "NSN", value: property.nsn)
                 DetailRow(label: "Serial Number", value: property.serialNumber ?? "N/A")
                 Divider()
                 DetailRow(label: "Status", value: property.status ?? "N/A")
                 DetailRow(label: "Location", value: property.location ?? "N/A")
                 DetailRow(label: "Assigned To ID", value: property.assignedToUserId?.uuidString ?? "None")
                 // TODO: Fetch and display assigned user name?
                
                // Spacer() // Removed spacer for ScrollView
            }
            .padding()
        }
    }
}

// Helper view for consistent detail rows
struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label + ":")
                .bold()
                .frame(width: 120, alignment: .leading)
            Text(value)
            Spacer() // Pushes content to the left
        }
    }
}

// Ensure ActionStatusOverlay is accessible or defined here
// If it's in TransfersView.swift, it might need to be moved to its own file
// or defined again here (less ideal).

// Assuming ActionStatusOverlay is accessible:

// MARK: - Preview
struct PropertyDetailView_Previews: PreviewProvider {
    static var previews: some View {
        // Preview needs adjustment to work with new VM states and potentially MockAPIService
        NavigationView { // Wrap in NavigationView for Title
             let successVM = PropertyDetailViewModel(propertyId: Property.mockList[0].id.uuidString, apiService: MockAPIService(mockProperty: Property.mockList[0]))
             PropertyDetailView(viewModel: successVM)
                 .previewDisplayName("Success State")
        }
        NavigationView { // Wrap in NavigationView for Title
             let loadingVM = PropertyDetailViewModel(propertyId: UUID().uuidString, apiService: MockAPIService(simulatedDelay: 2.0))
             PropertyDetailView(viewModel: loadingVM)
                 .previewDisplayName("Loading State")
        }
        NavigationView { // Wrap in NavigationView for Title
             let errorVM = PropertyDetailViewModel(propertyId: UUID().uuidString, apiService: MockAPIService(shouldThrowError: true))
             PropertyDetailView(viewModel: errorVM)
                 .previewDisplayName("Error State")
        }
    }
} 