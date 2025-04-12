import SwiftUI

struct AuthenticatedTabView: View {
    @StateObject var authViewModel: AuthViewModel // Use @StateObject for owning the VM
    @State private var showingScanView = false // State to control sheet presentation

    var body: some View {
        TabView {
            // Reference DB Tab
            NavigationView {
                ReferenceDatabaseBrowserView()
            }
            .tabItem {
                Label("Ref DB", systemImage: "book.closed")
            }

            // My Properties Tab
            NavigationView {
                 MyPropertiesView()
            }
            .tabItem {
                Label("Properties", systemImage: "list.bullet.rectangle.portrait")
            }

            // Placeholder Scan Tab/Button - Now triggers sheet
            // We use a Button within a View for the tabItem content
            // to allow an action (presenting the sheet) instead of direct navigation.
            VStack {
                 Text("Scan Placeholder View") // Content for the tab itself
            }
            .tabItem {
                 Label("Scan", systemImage: "qrcode.viewfinder")
            }
            .onTapGesture {
                 // This is a workaround. Ideally, the tab itself would be a button.
                 // Alternatively, add a dedicated Scan button elsewhere in the UI.
                 showingScanView = true
            }
            // Consider adding a dedicated button outside the TabView for scanning
            // e.g., in the navigation bar or as a floating button overlay.

            // Transfers Tab
             NavigationView {
                 TransfersView() // Use the actual TransfersView
             }
             .tabItem {
                 Label("Transfers", systemImage: "arrow.right.arrow.left.circle")
             }

            // Settings/Profile Tab (Example)
            NavigationView {
                VStack(alignment: .leading) {
                    Text("Authenticated")
                        .font(.largeTitle)
                    Text("User: \(authViewModel.currentUser?.user.username ?? "N/A")")
                        .font(.caption)
                    Text("Token: \(authViewModel.currentUser?.token.prefix(10) ?? "N/A")...")
                    Button("Logout") {
                        authViewModel.logout()
                    }
                }
                .navigationTitle("Settings")
            }
            .tabItem {
                Label("Settings", systemImage: "gear")
            }
        }
        .sheet(isPresented: $showingScanView) { // Present ScanView as a sheet
             ScanView()
        }
    }
}

// Preview needs adjustment if AuthViewModel requires initialization
struct AuthenticatedTabView_Previews: PreviewProvider {
    static var previews: some View {
        // Create a default AuthViewModel for the preview
        AuthenticatedTabView(authViewModel: AuthViewModel())
    }
} 