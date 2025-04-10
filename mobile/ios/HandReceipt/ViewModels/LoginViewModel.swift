import Foundation
import Combine

// Enum for Login State
enum LoginState {
    case idle
    case loading
    case success(LoginResponse) // Include response on success
    case failed(String) // Include error message on failure
}

@MainActor
class LoginViewModel: ObservableObject {
    // --- State --- 
    @Published var username = ""
    @Published var password = ""
    @Published var loginState: LoginState = .idle
    @Published var canAttemptLogin = false // Computed based on inputs

    // --- Dependencies --- 
    private let apiService: APIServiceProtocol
    private var cancellables = Set<AnyCancellable>()

    init(apiService: APIServiceProtocol = APIService()) {
        self.apiService = apiService
        setupValidation()
    }

    // --- Validation --- 
    private func setupValidation() {
        // Combine publisher to check if both fields are non-empty
        Publishers.CombineLatest($username, $password)
            .map { username, password -> Bool in
                return !username.trimmingCharacters(in: .whitespaces).isEmpty && 
                       !password.isEmpty // Passwords usually aren't trimmed
            }
            .assign(to: &$canAttemptLogin)

        // Reset login state if inputs change after a failed/success attempt
         Publishers.CombineLatest($username, $password)
             .dropFirst() // Ignore initial state
            .sink { [weak self] _, _ in
                 guard let self = self else { return }
                 if case .failed = self.loginState { self.loginState = .idle }
                 if case .success = self.loginState { self.loginState = .idle }
             }
             .store(in: &cancellables)
    }

    // --- Actions --- 
    func attemptLogin() {
        guard canAttemptLogin else { return }
        guard case .loading = loginState else { // Prevent concurrent attempts
             loginState = .loading
            
             let credentials = LoginCredentials(
                username: username.trimmingCharacters(in: .whitespaces),
                password: password // Send password as entered
            )
            
             print("Attempting login for user: \(credentials.username)")

            Task {
                do {
                    let response = try await apiService.login(credentials: credentials)
                    // Login successful! Cookie should be stored by URLSession.
                     print("Login Successful: User \(response.username) (ID: \(response.userId))")
                    self.loginState = .success(response)
                     // The View should observe this state change and navigate

                } catch let apiError as APIService.APIError {
                     print("Login API Error: \(apiError.localizedDescription)")
                    let errorMessage: String
                    switch apiError {
                        case .unauthorized: errorMessage = "Invalid username or password."
                         case .networkError: errorMessage = "Network error. Please check connection."
                        default: errorMessage = apiError.localizedDescription
                    }
                    self.loginState = .failed(errorMessage)
                } catch {
                     print("Login Unknown Error: \(error)")
                    self.loginState = .failed("An unexpected error occurred during login.")
                }
            }
             return // Exit after starting task
        }
    }
} 