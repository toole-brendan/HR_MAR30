import SwiftUI

struct ContentView: View {
    // Simple state to track authentication.
    // In a real app, this would likely come from an ObservableObject (e.g., AuthManager)
    // that checks stored session tokens or performs a session check API call.
    @State private var isAuthenticated: Bool = false // Start as not authenticated
    
    // Store user info received on login (optional)
    @State private var loggedInUser: LoginResponse? = nil

    var body: some View {
        // Show LoginView if not authenticated
        if !isAuthenticated {
            LoginView {
                 // This closure is called by LoginView on success
                 loginResponse in
                 print("ContentView: Login successful for user \(loginResponse.username)")
                 // Update state to show the main app content
                 self.loggedInUser = loginResponse
                self.isAuthenticated = true
            }
        } else {
            // Show the main authenticated content
            MainAppView(loggedInUser: loggedInUser)
        }
    }
}

// Represents the main UI shown after authentication
struct MainAppView: View {
    let loggedInUser: LoginResponse? // Pass user info if needed
    @State private var showingManualEntrySheet = false

    var body: some View {
        // Use NavigationView as the base for authenticated screens
        NavigationView {
            ReferenceDatabaseBrowserView(
                // Inject necessary parameters if the view requires them
                 onItemConfirmed: handleItemConfirmation, // Example handler
                 onNavigateToManualEntry: {
                     showingManualEntrySheet = true
                 }
            )
             // Add toolbar items for actions like logout or manual entry
             .toolbar { 
                 ToolbarItem(placement: .navigationBarLeading) {
                     // Example: Display username
                     Text(loggedInUser?.username ?? "User")
                         .font(.caption)
                 }
                 ToolbarItem(placement: .navigationBarTrailing) {
                     Button {
                         showingManualEntrySheet = true
                     } label: {
                         Label("Manual Entry", systemImage: "square.and.pencil")
                     }
                 }
                  ToolbarItem(placement: .navigationBarTrailing) {
                     Button("Logout") { // Example Logout Button
                         // TODO: Implement logout logic (clear session, set isAuthenticated = false)
                         print("Logout tapped - Implement me!")
                         // For now, just force back to login for demo
                         // In real app, call APIService.logout(), clear state etc.
                         // This requires ContentView's isAuthenticated to be managed by an ObservableObject
                     }
                     .foregroundColor(.red)
                 }
             }
             // Present ManualSNEntryView as a sheet
             .sheet(isPresented: $showingManualEntrySheet) {
                 NavigationView { // Embed sheet content in NavigationView for title/buttons
                     ManualSNEntryView {
                         confirmedProperty in
                         print("Item confirmed via sheet: \(confirmedProperty.serialNumber)")
                         // Handle confirmation (e.g., trigger transfer)
                         showingManualEntrySheet = false // Dismiss sheet
                     }
                      .navigationTitle("Manual SN Entry")
                     .navigationBarTitleDisplayMode(.inline)
                     .toolbar {
                          ToolbarItem(placement: .navigationBarLeading) {
                             Button("Cancel") { showingManualEntrySheet = false }
                         }
                     }
                 }
             }
        }
    }
    
    // Placeholder function for item confirmation from Ref DB Browser (if needed)
    func handleItemConfirmation(property: Property) {
        print("Item confirmed from Ref DB Browser (if applicable): \(property.serialNumber)")
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
} 