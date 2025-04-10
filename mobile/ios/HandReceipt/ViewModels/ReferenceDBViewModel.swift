import Foundation
import Combine // Needed for ObservableObject

// ViewModel for the Reference Database Browser View
@MainActor // Ensure UI updates happen on the main thread
class ReferenceDBViewModel: ObservableObject {

    @Published var referenceItems: [ReferenceItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil

    // Dependency injection for the API service
    private let apiService: APIServiceProtocol

    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
    }

    // Function to fetch reference items from the API
    func loadReferenceItems() {
        // Don't fetch if already loading
        guard !isLoading else { return }

        isLoading = true
        errorMessage = nil // Clear previous errors

        Task {
            do {
                let items = try await apiService.fetchReferenceItems()
                self.referenceItems = items
            } catch {
                // Handle errors appropriately (e.g., show user-friendly message)
                self.errorMessage = "Failed to load items: \(error.localizedDescription)"
                print("Error loading reference items: \(error)")
            }
            // Ensure isLoading is set to false regardless of success or failure
            self.isLoading = false
        }
    }
} 