import SwiftUI

struct MyPropertiesView: View {
    @StateObject private var viewModel = MyPropertiesViewModel()
    
    // TODO: Define navigation action for property detail
     // var navigateToPropertyDetail: (String) -> Void

    var body: some View {
        NavigationView { // Add NavigationView for title and potential toolbar
             content
             .navigationTitle("My Properties")
        }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.loadingState {
            case .idle, .loading:
                 ProgressView("Loading Properties...")
                     .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            case .success(let properties):
                 if properties.isEmpty {
                     EmptyPropertiesStateView { viewModel.loadProperties() }
                 } else {
                     PropertyList(properties: properties)
                 }
            
            case .error(let message):
                 ErrorStateView(message: message) { viewModel.loadProperties() }
        }
    }
}

// MARK: - Subviews

struct PropertyList: View {
    let properties: [Property]
    
    var body: some View {
        List {
            ForEach(properties) { property in
                NavigationLink {
                    PropertyDetailView(propertyId: property.id.uuidString)
                } label: {
                    PropertyRow(property: property)
                }
            }
        }
        .listStyle(PlainListStyle())
        .refreshable { 
            // TODO: Add refresh capability to ViewModel if needed
             print("Refresh action triggered")
        }
    }
}

struct PropertyRow: View {
    let property: Property
    
    // TODO: Consider Date Formatter as a shared utility
    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .none
        return formatter
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(property.itemName).font(.headline)
                Text("SN: \(property.serialNumber)").font(.subheadline).foregroundColor(.gray)
                 if let lastInv = property.lastInventoryDate {
                     Text("Last Inv: \(lastInv, formatter: dateFormatter)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                 }
            }
            Spacer()
            Text(property.status).font(.caption).padding(.horizontal, 6).padding(.vertical, 2).background(Color.gray.opacity(0.2)).cornerRadius(4)
        }
        .padding(.vertical, 4) // Add some vertical padding within the row
    }
}

struct EmptyPropertiesStateView: View {
    let onRefresh: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "tray.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 60, height: 60)
                .foregroundColor(.secondary)
            Text("No Properties Assigned")
                .font(.title2)
                .fontWeight(.semibold)
            Text("Your assigned property list is currently empty.")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            Button("Refresh", action: onRefresh)
                .buttonStyle(.bordered)
                .padding(.top)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct ErrorStateView: View {
    let message: String
    let onRetry: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 60, height: 60)
                .foregroundColor(.red)
            Text("Error Loading Data")
                .font(.title2)
                .fontWeight(.semibold)
            Text(message)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry", action: onRetry)
                .buttonStyle(.borderedProminent)
                .padding(.top)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Preview

struct MyPropertiesView_Previews: PreviewProvider {
    static var previews: some View {
        // Example with success state
         let successVM = MyPropertiesViewModel(apiService: MockAPIService(mockProperties: Property.mockList))
        MyPropertiesView(viewModel: successVM)
            .previewDisplayName("Success State")

        // Example with empty state
         let emptyVM = MyPropertiesViewModel(apiService: MockAPIService(mockProperties: []))
        MyPropertiesView(viewModel: emptyVM)
            .previewDisplayName("Empty State")

        // Example with error state
         let errorVM = MyPropertiesViewModel(apiService: MockAPIService(shouldThrowError: true))
         MyPropertiesView(viewModel: errorVM)
            .previewDisplayName("Error State")
    }
}

// Add MockAPIService and mock data for previews
#if DEBUG
class MockAPIService: APIServiceProtocol {
    var mockProperties: [Property]?
    var mockReferenceItems: [ReferenceItem]? // Add for other potential mocks
    var mockProperty: Property? // Add for single property fetch
    var mockLoginResponse: LoginResponse? // Add for auth mocks
    var shouldThrowError = false
    var simulatedDelay: TimeInterval = 0.1

    func getMyProperties() async throws -> [Property] {
        try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
        if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
        return mockProperties ?? []
    }
    
    // Implement other protocol methods to return mock data or throw errors
     func fetchReferenceItems() async throws -> [ReferenceItem] { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
         if shouldThrowError { throw APIService.APIError.networkError(URLError(.notConnectedToInternet)) }
         return mockReferenceItems ?? []
     }
    func fetchPropertyBySerialNumber(serialNumber: String) async throws -> Property { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
        if shouldThrowError { throw APIService.APIError.itemNotFound }        
         if let prop = mockProperty, prop.serialNumber == serialNumber { return prop }
         throw APIService.APIError.itemNotFound
    }
    func login(credentials: LoginCredentials) async throws -> LoginResponse { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
        if shouldThrowError { throw APIService.APIError.unauthorized }
         return mockLoginResponse ?? LoginResponse(userId: UUID(), username: "mockUser", role: "user")
    }
    func checkSession() async throws -> LoginResponse { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
         if shouldThrowError { throw APIService.APIError.unauthorized }
         return mockLoginResponse ?? LoginResponse(userId: UUID(), username: "mockUser", role: "user")
    }
    func fetchReferenceItemById(itemId: String) async throws -> ReferenceItem { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
        if shouldThrowError { throw APIService.APIError.itemNotFound }        
         if let item = mockReferenceItems?.first(where: { $0.id.uuidString == itemId }) { return item }
         throw APIService.APIError.itemNotFound
    }
}

extension Property {
    static let mockList = [
        Property(id: UUID(), serialNumber: "SN123", itemName: "Test Prop 1", nsn: "1111-11-111-1111", status: "Operational", location: "Bldg 1", lastInventoryDate: Date()),
        Property(id: UUID(), serialNumber: "SN456", itemName: "Test Prop 2", nsn: "2222-22-222-2222", status: "Maintenance", location: "Bldg 2", lastInventoryDate: Calendar.current.date(byAdding: .day, value: -10, to: Date())),
        Property(id: UUID(), serialNumber: "SN789", itemName: "Test Prop 3", nsn: "3333-33-333-3333", status: "Operational", location: "Bldg 1", lastInventoryDate: Calendar.current.date(byAdding: .month, value: -1, to: Date()))
    ]
}
#endif 