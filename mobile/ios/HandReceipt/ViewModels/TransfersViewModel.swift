import Foundation
import Combine
import SwiftUI // Needed for UUID

enum TransfersState {
    case loading
    case success([Transfer])
    case error(String)
}

// Define Filter Enums
enum TransferDirectionFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case incoming = "Incoming"
    case outgoing = "Outgoing"
    var id: String { self.rawValue }
}

enum TransferStatusFilter: String, CaseIterable, Identifiable {
    case all = "All Statuses"
    case pending = "Pending"
    case history = "History" // Represents Approved/Rejected/Cancelled
    var id: String { self.rawValue }
}

@MainActor
class TransfersViewModel: ObservableObject {
    @Published var transfersState: TransfersState = .loading
    @Published var transfers: [Transfer] = [] // Keep a separate published array for easier list updates
    @Published var actionError: String? = nil // To show action-specific errors
    @Published var isPerformingAction: Bool = false // Indicate background activity for approve/reject
    
    // Add filter states
    @Published var directionFilter: TransferDirectionFilter = .all { didSet { fetchTransfers() } }
    @Published var statusFilter: TransferStatusFilter = .all { didSet { fetchTransfers() } }
    
    private let apiService = APIService.shared // Adjust if using DI
    private var cancellables = Set<AnyCancellable>()

    init() {
        fetchTransfers() // Initial fetch uses default filters
    }

    func fetchTransfers() { // Remove parameters, use published properties
        self.transfersState = .loading
        self.actionError = nil // Clear previous action errors
        self.isPerformingAction = false // Reset action indicator
        
        // Convert enum filters to API query strings
        let directionQuery: String?
        switch directionFilter {
            case .incoming: directionQuery = "incoming"
            case .outgoing: directionQuery = "outgoing"
            case .all: directionQuery = nil
        }
        
        let statusQuery: String?
        switch statusFilter {
            case .pending: statusQuery = "PENDING"
             // Combine multiple statuses for history if backend supports comma-separated values
             // Check backend API documentation for how it handles multiple statuses
            case .history: statusQuery = "APPROVED,REJECTED,CANCELLED" 
            case .all: statusQuery = nil
        }
        
        print("Fetching transfers with direction: \(directionQuery ?? "nil"), status: \(statusQuery ?? "nil")")
        
        apiService.fetchTransfers(status: statusQuery, direction: directionQuery) { [weak self] result in
            DispatchQueue.main.async {
                 guard let self = self else { return }
                 switch result {
                 case .success(let fetchedTransfers):
                     self.transfers = fetchedTransfers // Update the list
                     self.transfersState = .success(fetchedTransfers)
                     print("TransfersViewModel: Fetched \(fetchedTransfers.count) transfers")
                 case .failure(let error):
                      self.transfers = [] // Clear list on error
                      self.transfersState = .error(error.localizedDescription)
                     print("TransfersViewModel: Error fetching transfers - \(error.localizedDescription)")
                 }
             }
        }
    }
    
    func approveTransfer(transferId: UUID) {
        print("Attempting to approve transfer: \(transferId)")
        self.isPerformingAction = true
        self.actionError = nil
        
        apiService.approveTransfer(transferId: transferId) { [weak self] result in
             DispatchQueue.main.async {
                guard let self = self else { return }
                self.isPerformingAction = false
                switch result {
                case .success(let updatedTransfer):
                    print("Successfully approved transfer: \(transferId)")
                    // Refresh list respecting current filters
                    self.fetchTransfers()
                case .failure(let error):
                    print("Error approving transfer \(transferId): \(error.localizedDescription)")
                    self.actionError = "Failed to approve transfer: \(error.localizedDescription)"
                }
            }
        }
    }
    
    func rejectTransfer(transferId: UUID) {
         print("Attempting to reject transfer: \(transferId)")
         self.isPerformingAction = true
         self.actionError = nil
         
         apiService.rejectTransfer(transferId: transferId) { [weak self] result in
             DispatchQueue.main.async {
                 guard let self = self else { return }
                 self.isPerformingAction = false
                 switch result {
                 case .success(let updatedTransfer):
                     print("Successfully rejected transfer: \(transferId)")
                     // Refresh list respecting current filters
                     self.fetchTransfers()
                 case .failure(let error):
                     print("Error rejecting transfer \(transferId): \(error.localizedDescription)")
                     self.actionError = "Failed to reject transfer: \(error.localizedDescription)"
                 }
             }
         }
    }
    
    // TODO: Implement requestTransfer action
} 