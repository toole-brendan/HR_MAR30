import Foundation
import Combine

// Enum to represent the state of the data loading
enum PropertyDetailLoadingState {
    case idle
    case loading
    case success(Property) // Hold the fetched property
    case error(String)
}

@MainActor // Ensure UI updates happen on the main thread
class PropertyDetailViewModel: ObservableObject {

    @Published var loadingState: PropertyDetailLoadingState = .idle

    private let apiService: APIServiceProtocol
    private let propertyId: String

    init(propertyId: String, apiService: APIServiceProtocol = APIService()) {
        self.propertyId = propertyId
        self.apiService = apiService
        print("PropertyDetailViewModel initialized for property ID: \(propertyId)")
        fetchDetails()
    }

    func fetchDetails() {
        guard loadingState != .loading else { return }
        print("Attempting to fetch details for property: \(propertyId)")
        
        loadingState = .loading

        Task {
            do {
                let fetchedProperty = try await apiService.getPropertyById(propertyId: propertyId)
                loadingState = .success(fetchedProperty)
                print("Successfully fetched details for property: \(fetchedProperty.itemName)")
            } catch let apiError as APIService.APIError {
                 print("API Error fetching property details: \(apiError.localizedDescription)")
                 let message: String
                 switch apiError {
                 case .itemNotFound:
                     message = "Property not found."
                 case .unauthorized:
                     message = "Unauthorized. Please check login status."
                 case .networkError, .serverError:
                     message = "A network or server error occurred."
                 default:
                     message = apiError.localizedDescription
                 }
                 loadingState = .error(message)
            } catch {
                 print("Unexpected error fetching property details: \(error.localizedDescription)")
                 loadingState = .error("An unexpected error occurred.")
            }
        }
    }
} 