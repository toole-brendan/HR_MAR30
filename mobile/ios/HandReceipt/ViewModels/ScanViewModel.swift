import Foundation
import Combine

@MainActor
class ScanViewModel: ObservableObject {
    // TODO: Implement properties and logic for scanning
    // e.g., @Published var scannedCode: String?
    // @Published var lookupResult: Property?
    // @Published var isLoading: Bool = false
    // @Published var errorMessage: String?
    
    private let apiService: APIServiceProtocol
    
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
        print("ScanViewModel Initialized")
    }
    
    func processScannedCode(_ code: String) {
        print("Processing scanned code: \(code)")
        // TODO: Implement logic to look up property by SN or handle barcode data
    }
} 