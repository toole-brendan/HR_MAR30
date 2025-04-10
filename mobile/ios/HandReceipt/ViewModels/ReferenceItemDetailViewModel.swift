import Foundation
import SwiftUI // Needed for @Published

// Enum to represent the state of the data loading
enum LoadingState {
    case idle
    case loading
    case success
    case error(String)
}

@MainActor // Ensure UI updates happen on the main thread
class ReferenceItemDetailViewModel: ObservableObject {

    // Published properties to drive the UI
    @Published var item: ReferenceItem? = nil
    @Published var loadingState: LoadingState = .idle
    @Published var errorMessage: String? = nil

    // Dependency: APIServiceProtocol
    private let apiService: APIServiceProtocol
    private let itemId: String

    // Initializer with dependency injection
    init(itemId: String, apiService: APIServiceProtocol = APIService()) {
        self.itemId = itemId
        self.apiService = apiService
        print("ReferenceItemDetailViewModel initialized for item ID: \(itemId)")
        // Fetch details immediately upon initialization
        fetchDetails()
    }

    // Function to fetch item details from the API
    func fetchDetails() {
        guard loadingState != .loading else { return } // Prevent multiple concurrent loads
        print("Attempting to fetch details for item: \(itemId)")
        
        loadingState = .loading
        errorMessage = nil // Clear previous errors

        Task {
            do {
                let fetchedItem = try await apiService.fetchReferenceItemById(itemId: itemId)
                self.item = fetchedItem
                self.loadingState = .success
                print("Successfully fetched details for item: \(fetchedItem.itemName ?? "Unnamed")")
            } catch let apiError as APIService.APIError {
                 print("API Error fetching details: \(apiError.localizedDescription)")
                 let specificMessage:
                 switch apiError {
                 case .itemNotFound:
                     specificMessage = "Reference item not found."
                 case .unauthorized:
                     specificMessage = "Unauthorized. Please check login status."
                 case .networkError, .serverError:
                     specificMessage = "A network or server error occurred."
                 default:
                     specificMessage = apiError.localizedDescription
                 }
                 self.errorMessage = specificMessage
                 self.loadingState = .error(specificMessage)
            } catch {
                 print("Unexpected error fetching details: \(error.localizedDescription)")
                 let genericMessage = "An unexpected error occurred."
                 self.errorMessage = genericMessage
                 self.loadingState = .error(genericMessage)
            }
        }
    }
} 