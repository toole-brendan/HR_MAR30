import Foundation
import Combine
import SwiftUI // For UUID

enum UserListState {
    case idle
    case loading
    case success([User])
    case error(String)
}

@MainActor
class UserSelectionViewModel: ObservableObject {
    @Published var userListState: UserListState = .idle
    @Published var searchQuery: String = "" 
    
    private let apiService = APIService.shared
    private var searchDebounceTimer: AnyCancellable?
    private var fetchCancellable: AnyCancellable?

    init() {
        // Debounce search query
        searchDebounceTimer = $searchQuery
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] query in
                self?.fetchUsers(query: query)
            }
    }

    func fetchUsers(query: String) {
        fetchCancellable?.cancel() // Cancel previous fetch if any
        
        guard !query.isEmpty else {
            self.userListState = .idle // Clear results if query is empty
            return
        }
        
        self.userListState = .loading
        print("UserSelectionViewModel: Fetching users for query '\(query)'")

        // Store cancellable to manage request lifecycle
        fetchCancellable = apiService.fetchUsers(searchQuery: query) { [weak self] result in
             DispatchQueue.main.async {
                 guard let self = self else { return }
                 // Only update state if the query hasn't changed in the meantime
                 guard query == self.searchQuery else { 
                    print("UserSelectionViewModel: Stale result ignored for query '\(query)'")
                     return
                 }
                 
                 switch result {
                 case .success(let users):
                      print("UserSelectionViewModel: Found \(users.count) users for '\(query)'")
                     self.userListState = .success(users)
                 case .failure(let error):
                      print("UserSelectionViewModel: Error fetching users for '\(query)' - \(error.localizedDescription)")
                     self.userListState = .error(error.localizedDescription)
                 }
             }
        }
    }
    
     // Call when view disappears or search is cancelled
     func clearSearch() {
         fetchCancellable?.cancel()
         searchQuery = "" // This will trigger the debounce and clear the state via fetchUsers
         // self.userListState = .idle // Or set directly if preferred
     }
} 