import SwiftUI

struct PropertyDetailView: View {
    @StateObject private var viewModel: PropertyDetailViewModel
    
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
        content
            .navigationTitle("Property Detail") // Default title
            .navigationBarTitleDisplayMode(.inline)
            // Potentially update title when data loads
            .onChange(of: viewModel.loadingState) { newState in
                 // Can update navigation title here if needed, though requires more complex state management
            }
    }
    
    @ViewBuilder
    private var content: some View {
        switch viewModel.loadingState {
        case .idle, .loading:
            ProgressView("Loading Details...")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .success(let property):
            PropertyDetailContentView(property: property, dateFormatter: dateFormatter)
        case .error(let message):
            // Use the generic ErrorStateView from MyPropertiesView
            ErrorStateView(message: message) { 
                viewModel.fetchDetails()
            }
        }
    }
}

// Subview to display the property content
struct PropertyDetailContentView: View {
    let property: Property
    let dateFormatter: DateFormatter

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(property.itemName).font(.largeTitle).padding(.bottom, 4)

                PropertyInfoRowView(label: "Serial Number", value: property.serialNumber)
                PropertyInfoRowView(label: "NSN", value: property.nsn)
                PropertyInfoRowView(label: "Status", value: property.status)
                PropertyInfoRowView(label: "Location", value: property.location)

                if let lastInv = property.lastInventoryDate {
                    PropertyInfoRowView(label: "Last Inventory", value: lastInv, formatter: dateFormatter)
                }
                if let acqDate = property.acquisitionDate {
                    PropertyInfoRowView(label: "Acquisition Date", value: acqDate, formatter: dateFormatter)
                }
                 if let assignedTo = property.assignedToUserId {
                    // TODO: Fetch and display user name
                    PropertyInfoRowView(label: "Assigned To", value: "User ID: \(assignedTo.uuidString)")
                 }
                if let notes = property.notes, !notes.isEmpty {
                     Divider()
                     Text("Notes").font(.headline)
                     Text(notes).font(.body)
                 }

                 Divider()
                
                 // Action Buttons
                 HStack(spacing: 12) {
                     Spacer()
                     Button {
                         // TODO: Implement Transfer Action
                         print("Initiate Transfer Tapped")
                     } label: {
                         Label("Initiate Transfer", systemImage: "arrow.right.arrow.left.circle.fill")
                     }
                     .buttonStyle(.borderedProminent)

                     Button {
                         // TODO: Implement View History Action
                         print("View History Tapped")
                     } label: {
                          Label("History", systemImage: "list.bullet.clipboard.fill")
                     }
                     .buttonStyle(.bordered)
                     Spacer()
                 }
                 .padding(.top)

            }
            .padding()
        }
    }
}

// Reusable Row View for Detail Screens
struct PropertyInfoRowView: View {
    let label: String
    let value: String?
    var formatter: Formatter? = nil
    
    init(label: String, value: String?) {
        self.label = label
        self.value = value
        self.formatter = nil
    }
    
    init(label: String, value: Date?, formatter: Formatter) {
        self.label = label
        self.formatter = formatter
        if let dateValue = value {
             self.value = formatter.string(for: dateValue)
         } else {
             self.value = nil
         }
    }

    var body: some View {
        HStack(alignment: .top) {
            Text("\(label):")
                .font(.headline)
                .frame(width: 140, alignment: .leading)
            Text(value ?? "N/A")
                .font(.body)
                .foregroundColor(value == nil ? .secondary : .primary)
            Spacer() // Push content to leading edge
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