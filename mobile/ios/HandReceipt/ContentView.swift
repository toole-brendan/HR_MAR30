import SwiftUI

struct ContentView: View {
    // Simple state to track authentication.
    // In a real app, this would likely come from an ObservableObject (e.g., AuthManager)
    // that checks stored session tokens or performs a session check API call.
    @State private var isAuthenticated: Bool = false // Start as not authenticated
    @State private var loggedInUser: LoginResponse? = nil
    @State private var isLoading: Bool = true // Added loading state

    // Inject the APIService
    private let apiService: APIServiceProtocol // Use protocol for testability

    // Initializer to inject the service
    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
    }

    var body: some View {
        // Show loading indicator while checking session
        if isLoading {
            ProgressView("Checking session...")
                .onAppear(perform: checkSessionStatus) // Check status when view appears
        } else if !isAuthenticated {
            LoginView {
                 // This closure is called by LoginView on success
                 loginResponse in
                 print("ContentView: Login successful for user \(loginResponse.username)")
                 // Update state to show the main app content
                 // Use MainActor.run for state updates triggered from background tasks (like login)
                 Task { @MainActor in
                     self.loggedInUser = loginResponse
                     self.isAuthenticated = true
                 }
            }
            // Pass the injected apiService if LoginView needs it
            // .environmentObject(apiService) // Example if using EnvironmentObject
        } else {
            // Use TabView for the main authenticated view
            AuthenticatedTabView(loggedInUser: loggedInUser) {
                // Logout callback
                print("ContentView: Received logout request")
                Task { @MainActor in
                    self.isAuthenticated = false
                    self.loggedInUser = nil
                }
                // Optional: API logout call
            }
             // Pass API service via environment if needed by tabs
             // .environmentObject(APIService()) 
        }
    }

    // Function to check session status
    private func checkSessionStatus() {
        // Ensure we only run this check once if .onAppear fires multiple times
        // or if we already successfully authenticated via login
        guard isLoading, !isAuthenticated else { return }

        Task {
            do {
                print("ContentView: Checking session status...")
                let user = try await apiService.checkSession()
                print("ContentView: Session check successful for user \(user.username)")
                // Update state on the main thread
                await MainActor.run {
                    self.loggedInUser = user
                    self.isAuthenticated = true
                    self.isLoading = false
                }
            } catch {
                print("ContentView: Session check failed or no active session. Error: \(error)")
                // Explicitly handle unauthorized specifically if needed
                if let apiError = error as? APIService.APIError, case .unauthorized = apiError {
                    print("ContentView: No valid session found (Unauthorized).")
                } else {
                     // Handle other errors (network, decoding etc.) - maybe show an alert
                     print("ContentView: An error occurred during session check: \(error.localizedDescription)")
                }
                // Update state on the main thread - stay unauthenticated
                await MainActor.run {
                    self.isAuthenticated = false
                    self.loggedInUser = nil
                    self.isLoading = false
                }
            }
        }
    }
}

// New View for the Authenticated Tab Structure
struct AuthenticatedTabView: View {
    let loggedInUser: LoginResponse?
    let onLogout: () -> Void
    
    @State private var selectedTab: Tab = .properties 

    enum Tab {
        case properties
        case referenceDb
        case scan
        case transfers
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            // Tab 1: My Properties
            MyPropertiesView()
                .tabItem { Label("My Properties", systemImage: "list.bullet.rectangle.portrait") }
                .tag(Tab.properties)
            
            // Tab 2: Reference DB Browser
            ReferenceDatabaseBrowserView()
                .tabItem { Label("Reference DB", systemImage: "book.closed") }
                .tag(Tab.referenceDb)

            // Tab 3: Scan View (Placeholder)
             ScanView()
                 .tabItem { Label("Scan", systemImage: "barcode.viewfinder") }
                 .tag(Tab.scan)

            // Tab 4: Transfers View (Placeholder)
             TransfersView()
                 .tabItem { Label("Transfers", systemImage: "arrow.right.arrow.left.square") }
                 .tag(Tab.transfers)
        }
         // Optional: Add a common toolbar if needed across all tabs
         // This would require removing NavigationViews from child views
         // and managing navigation state differently.
         // For now, each tab has its own NavigationView.
         
         // Example of adding a global logout (maybe less ideal UX than profile screen)
         // .toolbar {
         //     ToolbarItem(placement: .navigationBarTrailing) {
         //         Button("Logout") { onLogout() }.foregroundColor(.red)
         //     }
         // }
    }
}

// Preview needs adjustment or removal if APIService injection is complex
// For now, we comment it out as it requires more setup with the APIService dependency.
// struct ContentView_Previews: PreviewProvider {
//     static var previews: some View {
//         // Need to provide a mock APIService or handle the dependency here
//         // ContentView(apiService: MockAPIService())
//         ContentView() // This will now use the default APIService(), potentially making network calls
//     }
// } 