import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    
    // Callback invoked on successful login, passing the response
    // Used by the containing view/coordinator to navigate away.
    var onLoginSuccess: (LoginResponse) -> Void

    var body: some View {
        NavigationView { // Or use within an existing NavigationView
            VStack(spacing: 20) {
                 Spacer()
                 // App Title or Logo
                 Text("HandReceipt")
                     .font(.largeTitle)
                     .fontWeight(.bold)
                 Text("Mobile Access")
                     .font(.headline)
                     .foregroundColor(.secondary)
                
                 Spacer()

                // --- Input Fields --- 
                VStack(spacing: 15) {
                    TextField("Username", text: $viewModel.username)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .textContentType(.username)
                        .keyboardType(.asciiCapable) // Allow most chars but suggest no emoji etc.
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    SecureField("Password", text: $viewModel.password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .textContentType(.password)
                }
                .padding(.horizontal, 40)
                
                // --- Error Message --- 
                 // Use a specific frame height to prevent layout jumps
                 // when error message appears/disappears
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.red)
                    .frame(height: 30, alignment: .leading)
                    .padding(.horizontal, 40)

                // --- Login Button --- 
                Button {
                    viewModel.attemptLogin()
                } label: {
                    // Show activity indicator when loading
                    if case .loading = viewModel.loginState {
                         ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .frame(height: 20) // Match text height
                    } else {
                        Text("Login")
                    }
                }
                .buttonStyle(.borderedProminent)
                 .frame(maxWidth: .infinity)
                 .frame(height: 44) // Standard button height
                 .padding(.horizontal, 40)
                .disabled(!viewModel.canAttemptLogin || viewModel.loginState == .loading)
                 // Add slight scale effect on press for visual feedback
                 .scaleEffect(viewModel.loginState == .loading ? 0.98 : 1.0) 
                 .animation(.spring(response: 0.3, dampingFraction: 0.6), value: viewModel.loginState == .loading)

                 Spacer()
                 Spacer()
            }
            .padding(.bottom, 30)
            .navigationTitle("Login")
            .navigationBarHidden(true) // Hide nav bar for a cleaner login screen
             // Observe login state changes for navigation
             .onChange(of: viewModel.loginState) { newState in
                 if case .success(let response) = newState {
                     // Delay slightly to allow user to see success (optional)
                     // DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                         onLoginSuccess(response)
                     // }
                 }
             }
        }
        // Ignore safe area if needed for background image/color
         // .ignoresSafeArea(.keyboard) // Keep content visible when keyboard appears
    }
    
    // Helper to get the error message text from the state
    private var errorMessage: String {
        if case .failed(let message) = viewModel.loginState {
            return message
        } else {
            return "" // Return empty string when no error
        }
    }
}

// --- Preview --- 
struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView { loginResponse in
            print("Preview Login Success: User \(loginResponse.username)")
        }
        .previewDisplayName("Idle State")

         // Simulate error state (requires modifying ViewModel in preview)
         // You might create a mock ViewModel or pass state directly for previews
         // LoginView(viewModel: createMockErrorViewModel(), onLoginSuccess: { _ in })
    }
} 