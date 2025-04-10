import Foundation
import Combine // For ObservableObject

// Enum to represent the state of loading user properties
enum MyPropertiesLoadingState {
    case idle
    case loading
    case success([Property]) // Hold the fetched properties on success
    case error(String) // Hold the error message on failure
}

@MainActor
class MyPropertiesViewModel: ObservableObject {
    
    @Published var loadingState: MyPropertiesLoadingState = .idle
    
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
        loadProperties()
    }
    
    func loadProperties() {
        guard loadingState != .loading else { return }
        
        loadingState = .loading
        print("MyPropertiesViewModel: Loading properties...")
        
        Task {
            do {
                let properties = try await apiService.getMyProperties()
                loadingState = .success(properties)
                print("MyPropertiesViewModel: Successfully loaded \(properties.count) properties.")
            } catch let apiError as APIService.APIError {
                print("MyPropertiesViewModel: API Error loading properties - \(apiError.localizedDescription)")
                let message: String
                switch apiError {
                    case .unauthorized: message = "Unauthorized. Please login again."
                    case .networkError: message = "Network error. Check connection."
                    case .serverError: message = "Server error occurred."
                    default: message = apiError.localizedDescription
                }
                loadingState = .error(message)
            } catch {
                print("MyPropertiesViewModel: Unknown error loading properties - \(error.localizedDescription)")
                loadingState = .error("An unexpected error occurred.")
            }
        }
    }
} 