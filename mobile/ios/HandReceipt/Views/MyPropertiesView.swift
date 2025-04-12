import SwiftUI

struct MyPropertiesView: View {
    @StateObject private var viewModel: MyPropertiesViewModel
    
    // TODO: Define navigation action for property detail
     // var navigateToPropertyDetail: (String) -> Void

    init(viewModel: MyPropertiesViewModel? = nil) {
        let vm = viewModel ?? MyPropertiesViewModel(apiService: APIService())
        self._viewModel = StateObject(wrappedValue: vm)
    }

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
                     PropertyList(properties: properties, viewModel: viewModel)
                 }
            
            case .error(let message):
                 ErrorStateView(message: message) { viewModel.loadProperties() }
        }
    }
}

// MARK: - Subviews

struct PropertyList: View {
    let properties: [Property]
    @StateObject var viewModel: MyPropertiesViewModel
    
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
            viewModel.loadProperties()
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
        Group {
            MyPropertiesView(viewModel: {
                let vm = MyPropertiesViewModel(apiService: MockAPIService())
                vm.loadingState = .success(Property.mockList)
                return vm
            }())
            .previewDisplayName("Success State")

            // Example with empty state
            MyPropertiesView(viewModel: {
                let vm = MyPropertiesViewModel(apiService: MockAPIService())
                vm.loadingState = .success([])
                return vm
            }())
            .previewDisplayName("Empty State")

            // Example with error state
            MyPropertiesView(viewModel: {
                let vm = MyPropertiesViewModel(apiService: MockAPIService())
                vm.loadingState = .error("An error occurred while loading properties.")
                return vm
            }())
            .previewDisplayName("Error State")
        }
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
         return mockLoginResponse ?? LoginResponse(userId: 123, username: "mockUser", message: "Mock login successful")
    }
    func checkSession() async throws -> LoginResponse { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
         if shouldThrowError { throw APIService.APIError.unauthorized }
         return mockLoginResponse ?? LoginResponse(userId: 123, username: "mockUser", message: "Mock session")
    }
    func fetchReferenceItemById(itemId: String) async throws -> ReferenceItem { 
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
        if shouldThrowError { throw APIService.APIError.itemNotFound }        
         if let item = mockReferenceItems?.first(where: { $0.id.uuidString == itemId }) { return item }
         throw APIService.APIError.itemNotFound
    }
    // Add missing methods required by protocol
     func getPropertyById(propertyId: String) async throws -> Property {
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
         if shouldThrowError { throw APIService.APIError.itemNotFound }
         if let prop = mockProperty, prop.id.uuidString == propertyId { return prop }
         if let prop = mockProperties?.first(where: { $0.id.uuidString == propertyId }) { return prop }
         throw APIService.APIError.itemNotFound
     }
     func logout() async throws {
         try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))
         if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
         // No return value needed
     }
     // Add baseURLString requirement
     var baseURLString: String { "http://mock.api" }

     // Add missing stubs for protocol conformance
     func fetchTransfers(status: String?, direction: String?) async throws -> [Transfer] {
         if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
         return [] // Return empty array for mock
     }
     func requestTransfer(propertyId: UUID, targetUserId: UUID) async throws -> Transfer {
         if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
         // Need to create a mock Transfer or throw an error appropriate for previews
         throw APIService.APIError.unknownError // Placeholder: Or return a mock Transfer
     }
     func approveTransfer(transferId: UUID) async throws -> Transfer {
         if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
         throw APIService.APIError.unknownError // Placeholder
     }
     func rejectTransfer(transferId: UUID) async throws -> Transfer {
         if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
         throw APIService.APIError.unknownError // Placeholder
     }
     func fetchUsers(searchQuery: String?) async throws -> [UserSummary] {
         if shouldThrowError { throw APIService.APIError.serverError(statusCode: 500) }
         return [] // Return empty user array
     }

}

extension Property {
    static let mockList = [
        Property(id: UUID(), serialNumber: "SN123", nsn: "1111-11-111-1111", itemName: "Test Prop 1", description: "Mock Description 1", manufacturer: "Mock Manu", imageUrl: nil, status: "Operational", assignedToUserId: nil, location: "Bldg 1", lastInventoryDate: Date(), acquisitionDate: nil, notes: nil),
        Property(id: UUID(), serialNumber: "SN456", nsn: "2222-22-222-2222", itemName: "Test Prop 2", description: "Mock Description 2", manufacturer: "Mock Manu", imageUrl: nil, status: "Maintenance", assignedToUserId: nil, location: "Bldg 2", lastInventoryDate: Calendar.current.date(byAdding: .day, value: -10, to: Date()), acquisitionDate: nil, notes: nil),
        Property(id: UUID(), serialNumber: "SN789", nsn: "3333-33-333-3333", itemName: "Test Prop 3", description: "Mock Description 3", manufacturer: "Mock Manu", imageUrl: nil, status: "Operational", assignedToUserId: nil, location: "Bldg 1", lastInventoryDate: Calendar.current.date(byAdding: .month, value: -1, to: Date()), acquisitionDate: nil, notes: nil)
    ]
}
#endif 