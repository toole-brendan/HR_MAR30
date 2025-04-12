import Foundation

// Define a protocol for the API service to allow for mocking/testing
protocol APIServiceProtocol {
    // Function to fetch reference items. Throws errors for network/parsing issues.
    func fetchReferenceItems() async throws -> [ReferenceItem]

    // Function to fetch a specific property by its serial number.
    func fetchPropertyBySerialNumber(serialNumber: String) async throws -> Property

    // Function to login a user.
    func login(credentials: LoginCredentials) async throws -> LoginResponse

    // Function to check the current session status by fetching user profile.
    func checkSession() async throws -> LoginResponse

    // Add function to fetch a specific reference item by ID
    func fetchReferenceItemById(itemId: String) async throws -> ReferenceItem

    // Add function to fetch current user's properties
    func getMyProperties() async throws -> [Property] // Expect a list of Property objects

    // Add function to fetch specific property by ID
    func getPropertyById(propertyId: String) async throws -> Property

    // Function to logout the user.
    func logout() async throws

    // Add other API functions here as needed (e.g., fetch by NSN, etc.)
    // func fetchItemByNSN(nsn: String) async throws -> ReferenceItem
    
    // --- Transfer Functions ---
    func fetchTransfers(status: String?, direction: String?) async throws -> [Transfer]
    func requestTransfer(propertyId: UUID, targetUserId: UUID) async throws -> Transfer
    func approveTransfer(transferId: UUID) async throws -> Transfer
    func rejectTransfer(transferId: UUID) async throws -> Transfer

    // --- User Functions ---
    func fetchUsers(searchQuery: String?) async throws -> [UserSummary] // Expect UserSummary for selection

    // Add requirement for base URL string for cookie clearing
    var baseURLString: String { get }
}

// Concrete implementation of the API service
class APIService: APIServiceProtocol {

    // Replace with your actual backend base URL
    private let baseURL = URL(string: "http://localhost:8080/api")! // Example URL
    var baseURLString: String { baseURL.absoluteString } // Conform to protocol

    // Use URLSession.shared by default, which handles cookies automatically via HTTPCookieStorage
    private let urlSession: URLSession

    // Allow injecting a custom URLSession (e.g., for testing or specific configurations)
    init(urlSession: URLSession = .shared) {
        self.urlSession = urlSession
         // Optional: Verify cookie policy if needed
         // print("Using Cookie Storage: \(urlSession.configuration.httpCookieStorage?.description ?? "nil")")
         // print("Cookie Accept Policy: \(urlSession.configuration.httpCookieAcceptPolicy.rawValue)")
         // Default is .onlyFromMainDocumentDomain which might be too strict if API is on different subdomain.
         // Consider setting urlSession.configuration.httpCookieAcceptPolicy = .always if needed, but be careful.
    }

    // Error enum for specific API related errors
    enum APIError: Error, LocalizedError {
        case invalidURL
        case networkError(Error)
        case decodingError(Error)
        case serverError(statusCode: Int, message: String? = nil)
        case itemNotFound
        case unauthorized // Added for login failures (401)
        case unknownError

        var errorDescription: String? {
            switch self {
            case .invalidURL: return "Invalid request URL."
            case .networkError(let error): return "Network error: \(error.localizedDescription)"
            case .decodingError(let error): return "Failed to decode response: \(error.localizedDescription)"
            case .serverError(let statusCode, let message):
                return "Server error \(statusCode)\(message != nil ? ": \(message!)" : ".")"
            case .itemNotFound: return "Item not found (404)."
            case .unauthorized: return "Unauthorized (401). Check credentials or session."
            case .unknownError: return "An unknown error occurred."
            }
        }
    }

    // Shared JSON Encoder/Decoder configuration
    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        // Configure encoder if needed (e.g., date strategy)
        return encoder
    }()
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601 // Matches Property model
        return decoder
    }()

    // Helper function to handle common request logic
    private func performRequest<T: Decodable>(request: URLRequest) async throws -> T {
        print("(\(request.httpMethod ?? "?")) Performing request to: \(request.url?.absoluteString ?? "invalid URL")")
        // Log cookies being sent (for debugging)
        // if let cookies = urlSession.configuration.httpCookieStorage?.cookies(for: request.url!) {
        //     let headers = HTTPCookie.requestHeaderFields(with: cookies)
        //     print("Sending Cookies: \(headers["Cookie"] ?? "None")")
        // }

        do {
             // Use the instance's urlSession
            let (data, response) = try await urlSession.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.unknownError
            }

            print("Received status code: \(httpResponse.statusCode) from \(request.url?.path ?? "?")")
            // Log cookies received (for debugging)
            // if let headers = httpResponse.allHeaderFields as? [String: String], let url = request.url {
            //     let cookies = HTTPCookie.cookies(withResponseHeaderFields: headers, for: url)
            //     HTTPCookieStorage.shared.setCookies(cookies, for: url, mainDocumentURL: nil)
            //     print("Received Set-Cookie: \(cookies.map { $0.name + "=" + $0.value }).joined(separator: "; "))")
            // }

            guard (200...299).contains(httpResponse.statusCode) else {
                let errorMessage = String(data: data, encoding: .utf8)
                print("Server error body: \(errorMessage ?? "nil")")
                
                if httpResponse.statusCode == 404 {
                    throw APIError.itemNotFound
                }
                if httpResponse.statusCode == 401 {
                    throw APIError.unauthorized
                }
                throw APIError.serverError(statusCode: httpResponse.statusCode, message: errorMessage)
            }

            // Handle cases with no expected response body (e.g., 204)
             if T.self == EmptyResponse.self { // Assuming an EmptyResponse struct for clarity
                 // Check if data is empty or handle as needed for 204
                 if data.isEmpty {
                    return EmptyResponse() as! T
                 }
             }

            do {
                let decodedObject = try decoder.decode(T.self, from: data)
                print("Successfully decoded response of type \(T.self)")
                return decodedObject
            } catch {
                print("Decoding error: \(error) - Raw Data: \(String(data: data, encoding: .utf8) ?? "Invalid UTF8")")
                throw APIError.decodingError(error)
            }

        } catch let error as APIError {
            throw error // Re-throw known API errors
        } catch {
            print("Network/URLSession error: \(error)")
            throw APIError.networkError(error)
        }
    }

    // Login function implementation
    func login(credentials: LoginCredentials) async throws -> LoginResponse {
        let endpoint = baseURL.appendingPathComponent("/auth/login")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            request.httpBody = try encoder.encode(credentials)
        } catch {
            print("Failed to encode login credentials: \(error)")
            throw APIError.encodingError(error) // Add encodingError case if needed
        }

        // Expect LoginResponse object upon success
        return try await performRequest(request: request)
    }

    // Logout function implementation
    func logout() async throws {
        let endpoint = baseURL.appendingPathComponent("/auth/logout")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        // No body is typically needed for logout, the session cookie identifies the user

        // We expect a 2xx response (e.g., 200 OK or 204 No Content) on success.
        // performRequest handles status code checks and throws errors.
        // Since logout doesn't usually return data, we can expect EmptyResponse.
        let _: EmptyResponse = try await performRequest(request: request)
        print("APIService: Logout successful on server.")
    }

    // Check session function implementation
    func checkSession() async throws -> LoginResponse {
        let endpoint = baseURL.appendingPathComponent("/users/me") // Correct endpoint path
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        // Cookies are handled automatically by URLSession/HTTPCookieStorage

        // Perform request, expecting LoginResponse (or a similar User Profile struct)
        // performRequest handles decoding and potential 401 unauthorized errors
        return try await performRequest(request: request)
    }

    func fetchReferenceItems() async throws -> [ReferenceItem] {
        let endpoint = baseURL.appendingPathComponent("/reference-db/items")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        // Cookies are handled automatically by URLSession/HTTPCookieStorage
        return try await performRequest(request: request)
    }

    func fetchPropertyBySerialNumber(serialNumber: String) async throws -> Property {
        guard let encodedSerialNumber = serialNumber.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else {
            throw APIError.invalidURL
        }
        let endpoint = baseURL.appendingPathComponent("/inventory/serial/\(encodedSerialNumber)")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        // Cookies are handled automatically by URLSession/HTTPCookieStorage
        return try await performRequest(request: request)
    }

    // Function to fetch a specific reference item by ID
    func fetchReferenceItemById(itemId: String) async throws -> ReferenceItem {
        guard let encodedItemId = itemId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else {
            throw APIError.invalidURL
        }
        let endpoint = baseURL.appendingPathComponent("/reference-db/items/\(encodedItemId)")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        // Cookies are handled automatically by URLSession/HTTPCookieStorage
        return try await performRequest(request: request)
    }

    // Function to fetch current user's properties
    func getMyProperties() async throws -> [Property] {
        let endpoint = baseURL.appendingPathComponent("/users/me/inventory") // Assumed endpoint
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        // Cookies are handled automatically by URLSession/HTTPCookieStorage
        return try await performRequest(request: request)
    }

    // Function to fetch specific property by ID
    func getPropertyById(propertyId: String) async throws -> Property {
        guard let encodedPropertyId = propertyId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else {
            throw APIError.invalidURL
        }
        let endpoint = baseURL.appendingPathComponent("/inventory/id/\(encodedPropertyId)") // Assumed endpoint
        var request = URLRequest(url: endpoint)
        request.httpMethod = "GET"
        // Cookies handled automatically
        return try await performRequest(request: request)
    }

    // Fetch Property Detail
    func fetchPropertyDetail(propertyId: String, completion: @escaping (Result<Property, Error>) -> Void) {
        let urlString = baseURL.appendingPathComponent("/api/inventory/\(propertyId)").absoluteString
        performRequest(urlString: urlString, method: "GET", completion: completion)
    }

    // Fetch Property by Serial Number
    func fetchPropertyBySerial(serialNumber: String, completion: @escaping (Result<Property, Error>) -> Void) {
        // Ensure serialNumber is URL encoded if it might contain special characters
        guard let encodedSerial = serialNumber.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else {
            completion(.failure(APIError.invalidURL))
            return
        }
        let urlString = baseURL.appendingPathComponent("/api/inventory/serial/\(encodedSerial)").absoluteString
        performRequest(urlString: urlString, method: "GET", completion: completion)
    }

    // --- Transfer Functions (Async/Await) ---
    
    // Fetch Transfers (with optional filters)
    func fetchTransfers(status: String? = nil, direction: String? = nil) async throws -> [Transfer] {
        var components = URLComponents(url: baseURL.appendingPathComponent("/transfers"), resolvingAgainstBaseURL: false)!
        var queryItems = [URLQueryItem]()
        if let status = status, !status.isEmpty { queryItems.append(URLQueryItem(name: "status", value: status)) }
        if let direction = direction, !direction.isEmpty { queryItems.append(URLQueryItem(name: "direction", value: direction)) }
        if !queryItems.isEmpty { components.queryItems = queryItems }
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        return try await performRequest(request: request)
    }
    
    // Request Transfer
    func requestTransfer(propertyId: UUID, targetUserId: UUID) async throws -> Transfer {
        let endpoint = baseURL.appendingPathComponent("/transfers")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let requestBody = TransferRequest(propertyId: propertyId, targetUserId: targetUserId)
        
        do {
            request.httpBody = try encoder.encode(requestBody)
        } catch {
            print("Failed to encode transfer request: \(error)")
            throw APIError.encodingError(error)
        }
        return try await performRequest(request: request)
    }
    
    // Approve Transfer
    func approveTransfer(transferId: UUID) async throws -> Transfer {
        let endpoint = baseURL.appendingPathComponent("/transfers/\(transferId.uuidString)/approve")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        // No body needed
        return try await performRequest(request: request)
    }
    
    // Reject Transfer
    func rejectTransfer(transferId: UUID) async throws -> Transfer {
        let endpoint = baseURL.appendingPathComponent("/transfers/\(transferId.uuidString)/reject")
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        // No body needed
        return try await performRequest(request: request)
    }

    // --- User Functions (Async/Await) ---

    // Fetch Users (with optional search)
    func fetchUsers(searchQuery: String? = nil) async throws -> [UserSummary] {
        var components = URLComponents(url: baseURL.appendingPathComponent("/users"), resolvingAgainstBaseURL: false)!
        if let query = searchQuery, !query.isEmpty {
            components.queryItems = [URLQueryItem(name: "search", value: query)]
        }
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        return try await performRequest(request: request)
    }
}

// Helper struct for requests expecting no response body (e.g., 204)
struct EmptyResponse: Decodable {}

// Add encodingError to APIError enum if needed
extension APIService.APIError {
     static func encodingError(_ error: Error) -> APIService.APIError {
         // Define how you want to represent encoding errors
         return .unknownError // Or a new specific case
     }
} 