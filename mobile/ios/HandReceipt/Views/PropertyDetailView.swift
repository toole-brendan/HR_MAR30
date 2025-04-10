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
            if viewModel.isLoading {
                ProgressView()
            } else if let property = viewModel.property {
                PropertyDetailContent(property: property, viewModel: viewModel)
            } else if let errorMessage = viewModel.errorMessage {
                Text("Error: \(errorMessage)")
                    .foregroundColor(.red)
            } else {
                Text("Property details could not be loaded.")
            }
        }
        .navigationTitle(viewModel.property?.serialNumber ?? "Details")
         .navigationBarTitleDisplayMode(.inline)
         .toolbar { // Add actions to toolbar
             ToolbarItem(placement: .navigationBarTrailing) {
                 if viewModel.property != nil { // Only show if property is loaded
                    Button("Request Transfer") {
                         viewModel.requestTransferClicked()
                     }
                      .disabled(viewModel.transferRequestState == .loading) // Disable if already requesting
                 }
             }
         }
         // Present User Selection Sheet
         .sheet(isPresented: $viewModel.showingUserSelection) {
             UserSelectionView(onUserSelected: { selectedUser in
                 viewModel.initiateTransfer(targetUser: selectedUser)
             })
         }
         // TODO: Display transferRequestState feedback (loading/success/error)
         // Similar to TransferStatusMessage in ScanView, perhaps as an overlay or alert
         .overlay( // Example: Simple overlay for loading/error
             Group { 
                 if viewModel.transferRequestState == .loading {
                     ProgressView("Requesting Transfer...")
                         .padding()
                         .background(.thinMaterial)
                         .cornerRadius(10)
                 } else if case .error(let msg) = viewModel.transferRequestState {
                      Text("Transfer Error: \(msg)")
                         .padding()
                         .foregroundColor(.white)
                         .background(Color.red.opacity(0.8))
                         .cornerRadius(10)
                         // Auto-dismiss error? Or require user interaction?
                 } else if case .success = viewModel.transferRequestState {
                      // Success message handled by timer in VM for now
                      // Could show temporary checkmark here
                      Image(systemName: "checkmark.circle.fill")
                          .resizable()
                          .frame(width: 50, height: 50)
                          .foregroundColor(.green)
                          .padding()
                          .background(.thinMaterial)
                          .cornerRadius(10)
                 }
             }
             .animation(.easeInOut, value: viewModel.transferRequestState)
         )
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

// MARK: - Preview
struct PropertyDetailView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView { // Wrap in NavigationView for Title
             PropertyDetailView(propertyId: Property.mockList[0].id.uuidString)
                 // Provide a mock service for the preview
                 .environmentObject(MyPropertiesViewModel(apiService: MockAPIService(mockProperty: Property.mockList[0]))) // Need to adjust mocking
        }
    }
} 