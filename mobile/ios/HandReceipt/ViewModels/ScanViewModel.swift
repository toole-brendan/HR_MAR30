import Foundation
import Combine

enum ScanState {
    case scanning
    case loading
    case success(Property)
    case notFound
    case error(String)
}

@MainActor // Ensure UI updates happen on the main thread
class ScanViewModel: ObservableObject {
    @Published var scanState: ScanState = .scanning
    @Published var scannedCodeFromCamera: String? = nil // To receive code from CameraView
    
    // Add state to hold the confirmed property
    @Published var confirmedProperty: Property? = nil
    @Published var transferRequestState: TransferRequestState = .idle // State for the transfer request itself
    
    private let apiService = APIService.shared // Assuming singleton, adjust if using DI
    private var cancellables = Set<AnyCancellable>()
    private var clearStateTimer: AnyCancellable? // Timer to clear success/error message

    // Nested enum for transfer request status
    enum TransferRequestState {
        case idle
        case loading
        case success(Transfer) // Return the created transfer record
        case error(String)
    }

    init() {
        // Observe changes from the CameraView's binding
        $scannedCodeFromCamera
            .compactMap { $0 } // Ignore nil values
            .sink { [weak self] code in
                self?.processScannedCode(code)
            }
            .store(in: &cancellables)
    }

    func processScannedCode(_ code: String) {
        guard !code.isEmpty else {
            scanState = .error("Scanned code is empty")
            return
        }

        // Basic filtering for common OCR noise
        guard code.count > 2 else { // Ignore very short codes
            print("Ignoring short scanned code: \(code)")
             // Don't show error, just keep scanning state
             // Maybe provide subtle feedback later?
            return
        }

        print("ScanViewModel: Processing code - \(code)")
        scanState = .loading
        confirmedProperty = nil // Clear previous property
        transferRequestState = .idle // Reset transfer state

        apiService.fetchPropertyBySerial(serialNumber: code) { [weak self] result in
            // Ensure updates are on the main thread
            DispatchQueue.main.async {
                guard let self = self else { return }
                // Ensure we are still in loading state before updating
                guard self.scanState == .loading else { return }
                
                switch result {
                case .success(let property):
                    print("ScanViewModel: Success - Found property \(property.serialNumber ?? "N/A")")
                    self.confirmedProperty = property // Store the property
                    self.scanState = .success(property)
                case .failure(let error):
                    if let apiError = error as? APIError, apiError == .notFound { // Check for specific 404 error
                         print("ScanViewModel: Error - Property not found for code \(code)")
                        self.scanState = .notFound
                    } else {
                        print("ScanViewModel: Error - \(error.localizedDescription) for code \(code)")
                        self.scanState = .error(error.localizedDescription)
                    }
                }
            }
        }
    }

    func scanAgain() {
        scannedCodeFromCamera = nil
        confirmedProperty = nil // Clear stored property
        transferRequestState = .idle // Reset transfer state
        scanState = .scanning
        print("ScanViewModel: Resetting state to Scanning")
    }
    
    // Function to call after user selection
    func initiateTransfer(targetUser: User) {
        guard let propertyToTransfer = confirmedProperty else {
            transferRequestState = .error("Cannot initiate transfer: Property not confirmed.")
            print("ScanViewModel Error: initiateTransfer called without confirmed property.")
            return
        }
        
        print("ScanViewModel: Initiating transfer for property \(propertyToTransfer.id) to user \(targetUser.id)")
        transferRequestState = .loading
        clearStateTimer?.cancel() // Cancel previous timer if any
        
        apiService.requestTransfer(propertyId: propertyToTransfer.id, targetUserId: targetUser.id) { [weak self] result in
             DispatchQueue.main.async {
                 guard let self = self else { return }
                 switch result {
                 case .success(let newTransfer):
                     print("ScanViewModel: Transfer request successful - ID \(newTransfer.id)")
                     self.transferRequestState = .success(newTransfer)
                     // Schedule state reset after delay
                     self.scheduleTransferStateReset(delay: 3.0) 
                     // Don't call scanAgain immediately, let message show
                     // self.scanAgain() 
                 case .failure(let error):
                      print("ScanViewModel: Transfer request failed - \(error.localizedDescription)")
                     self.transferRequestState = .error("Transfer failed: \(error.localizedDescription)")
                      // Schedule state reset after delay
                     self.scheduleTransferStateReset(delay: 5.0) // Longer delay for errors
                 }
             }
        }
    }
    
    // Helper to reset transfer state after a delay
    private func scheduleTransferStateReset(delay: TimeInterval) {
        clearStateTimer?.cancel()
        clearStateTimer = Just(()) // Create a publisher that fires once
            .delay(for: .seconds(delay), scheduler: RunLoop.main)
            .sink { [weak self] _ in
                print("Resetting transfer request state after delay.")
                self?.transferRequestState = .idle
                 // Go back to scanning state ONLY if the request was successful
                 // If it was an error, the user might want to stay on the confirmation screen
                 // to try again or scan again.
                 // if case .success = self?.transferRequestState { // Check previous state? Logic gets tricky.
                 // For simplicity, let's reset to scanning always *after* message shown
                 if self?.scanState != .scanning {
                      self?.scanAgain()
                 }
            }
    }
    
     // Ensure timer is cancelled if ViewModel deinitializes
     deinit {
         clearStateTimer?.cancel()
     }
} 