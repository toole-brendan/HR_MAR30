import SwiftUI
import Foundation
// Import our custom colors and styles directly by relative file path
// @_exported import class HandReceipt.AppColors
// @_exported import struct HandReceipt.PrimaryButtonStyle

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    
    // Callback invoked on successful login, passing the response
    // Used by the containing view/coordinator to navigate away.
    var onLoginSuccess: (LoginResponse) -> Void

    init(onLoginSuccess: @escaping (LoginResponse) -> Void) {
        self.onLoginSuccess = onLoginSuccess
        debugPrint("LoginView initialized")
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                headerView
                
                inputFieldsView
                
                errorMessageView
                
                #if DEBUG
                debugInfoView
                #endif
                
                loginButtonView
                
                Spacer()
            }
            .padding(.bottom, 30)
            .navigationTitle("Login")
            .navigationBarHidden(true) // Hide nav bar for a cleaner login screen
            .onChange(of: viewModel.loginState) { newState in
                debugPrint("LoginView: Login state changed to \(String(describing: newState))")
                if case .success(let response) = newState {
                    debugPrint("LoginView: Login successful for user: \(response.user.username)")
                    onLoginSuccess(response)
                }
            }
            .onAppear {
                debugPrint("LoginView appeared")
            }
            .onDisappear {
                debugPrint("LoginView disappeared")
            }
        }
    }
    
    // MARK: - View Components
    
    private var headerView: some View {
        VStack {
            Spacer()
            // App Title or Logo
            Text("HandReceipt")
                .font(.system(.largeTitle, design: .monospaced))
                .fontWeight(.bold)
                .foregroundColor(Color(.darkGray))
            Text("Mobile Access")
                .font(.system(.headline, design: .monospaced))
                .foregroundColor(Color(.darkGray).opacity(0.6))
                .padding(.top, 5)
            Spacer()
        }
    }
    
    private var inputFieldsView: some View {
        VStack(spacing: 20) {
            TextField("Username", text: $viewModel.username)
                .padding(12)
                .background(Color(.systemGray6))
                .cornerRadius(4) // Sharper corners for industrial look
                .foregroundColor(Color(.darkGray))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(Color(.darkGray).opacity(0.3), lineWidth: 1)
                )
                .textContentType(.username)
                .keyboardType(.asciiCapable)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .onChange(of: viewModel.username) { newValue in
                    debugPrint("Username changed: \(newValue.isEmpty ? "[empty]" : "[has value]")")
                }
            
            SecureField("Password", text: $viewModel.password)
                .padding(12)
                .background(Color(.systemGray6))
                .cornerRadius(4) // Sharper corners for industrial look
                .foregroundColor(Color(.darkGray))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(Color(.darkGray).opacity(0.3), lineWidth: 1)
                )
                .textContentType(.password)
                .onChange(of: viewModel.password) { newValue in
                    debugPrint("Password changed: \(newValue.isEmpty ? "[empty]" : "[has value]")")
                }
        }
        .padding(.horizontal, 40)
    }
    
    private var errorMessageView: some View {
        HStack(spacing: 4) {
            if !errorMessage.isEmpty {
                Image(systemName: "exclamationmark.circle")
                   .foregroundColor(.red) // Instead of AppColors.destructive
            }
            Text(errorMessage)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.red) // Instead of AppColors.destructive
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 30, alignment: .leading)
        .padding(.horizontal, 40)
    }
    
    #if DEBUG
    private var debugInfoView: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("DEBUG INFO")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.orange)
            
            Text("Login State: \(String(describing: viewModel.loginState))")
                .font(.caption)
                .foregroundColor(.gray)
            
            Text("Can Login: \(viewModel.canAttemptLogin ? "Yes" : "No")")
                .font(.caption)
                .foregroundColor(.gray)
            
            HStack {
                Button("Debug: Quick Login") {
                    debugPrint("Debug: Using quick login")
                    viewModel.username = "testuser"
                    viewModel.password = "password"
                }
                .font(.caption)
                .padding(4)
                .background(Color.blue.opacity(0.2))
                .cornerRadius(4)
                
                Button("Simulate Success") {
                    debugPrint("Debug: Simulating login success")
                    viewModel.simulateLoginSuccess()
                }
                .font(.caption)
                .padding(4)
                .background(Color.green.opacity(0.2))
                .cornerRadius(4)
                
                Button("Simulate Error") {
                    debugPrint("Debug: Simulating login error")
                    viewModel.simulateLoginError("Debug simulated error")
                }
                .font(.caption)
                .padding(4)
                .background(Color.red.opacity(0.2))
                .cornerRadius(4)
            }
        }
        .padding(.horizontal, 40)
        .padding(.vertical, 10)
    }
    #endif
    
    private var loginButtonView: some View {
        Button {
            debugPrint("Login button tapped - attempting login")
            viewModel.attemptLogin()
        } label: {
            if case .loading = viewModel.loginState {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .frame(height: 20)
            } else {
                Text("Login")
                    .font(.system(.headline, design: .monospaced))
                    .fontWeight(.semibold)
            }
        }
        // Industrial minimalist styling
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .foregroundColor(.white)
        .background(Color(red: 0.35, green: 0.40, blue: 0.45)) // Industrial slate blue-gray
        .cornerRadius(4) // Sharper corners for industrial look
        .scaleEffect(viewModel.loginState == .loading ? 0.98 : 1.0)
        .frame(maxWidth: .infinity)
        .frame(height: 50)
        .padding(.horizontal, 40)
        .padding(.top, 20)
        .disabled(!viewModel.canAttemptLogin || viewModel.loginState == .loading)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: viewModel.loginState == .loading)
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
            debugPrint("Preview Login Success: User \(loginResponse.user.username)")
        }
        .previewDisplayName("Idle State")
    }
} 