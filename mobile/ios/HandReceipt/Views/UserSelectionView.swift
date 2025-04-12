import SwiftUI

struct UserSelectionView: View {
    // Use @StateObject if this view creates the VM, 
    // @ObservedObject if it's passed in
    @StateObject private var viewModel = UserSelectionViewModel()
    
    // Callback to parent view when user is selected
    let onUserSelected: (UserSummary) -> Void
    // Callback to dismiss the view
    @Environment(\.dismiss) var dismiss 

    var body: some View {
        NavigationView { // Add NavigationView for title and search bar
            VStack {
                List {
                     switch viewModel.userListState {
                     case .idle:
                         Text("Enter search query to find users.")
                            .foregroundColor(.gray)
                     case .loading:
                         ProgressView()
                     case .success(let users):
                         if users.isEmpty {
                            Text("No users found.")
                                .foregroundColor(.gray)
                         } else {
                            ForEach(users) { user in
                                UserListItemView(user: user)
                                    .onTapGesture {
                                        onUserSelected(user)
                                        dismiss() // Dismiss after selection
                                    }
                            }
                         }
                     case .error(let message):
                         Text("Error: \(message)")
                             .foregroundColor(.red)
                     }
                 }
                 .listStyle(PlainListStyle())
                 // Make search bar part of the list on iOS 15+ for better integration
                 .searchable(text: $viewModel.searchQuery, prompt: "Search Users...")
                 .onDisappear { // Clear search when view disappears
                      viewModel.clearSearch()
                 }
            }
            .navigationTitle("Select User")
             .navigationBarTitleDisplayMode(.inline) // Use inline for modal presentation
             .toolbar { // Add Cancel button
                 ToolbarItem(placement: .navigationBarLeading) {
                     Button("Cancel") { dismiss() }
                 }
             }
        }
    }
}

// Simple view for displaying a user in the list
struct UserListItemView: View {
    let user: UserSummary

    var body: some View {
        VStack(alignment: .leading) {
             Text("\(user.rank ?? "") \(user.lastName ?? "")".trimmingCharacters(in: .whitespaces))
                 .font(.headline)
             Text("@\(user.username)")
                 .font(.subheadline)
                 .foregroundColor(.gray)
         }
         .padding(.vertical, 4)
    }
}

// Preview
struct UserSelectionView_Previews: PreviewProvider {
    static var previews: some View {
        UserSelectionView(onUserSelected: { user in
            print("Preview: Selected user \(user.username)")
        })
    }
} 