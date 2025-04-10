package com.example.handreceipt.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.handreceipt.data.model.LoginCredentials
import com.example.handreceipt.data.model.LoginResponse
import com.example.handreceipt.data.network.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException

// Sealed interface for Login UI State
sealed interface LoginUiState {
    object Idle : LoginUiState
    object Loading : LoginUiState
    data class Success(val response: LoginResponse) : LoginUiState // Pass response data on success
    data class Error(val message: String) : LoginUiState
}

class LoginViewModel : ViewModel() {

    // --- State --- 
    private val _username = MutableStateFlow("")
    val username: StateFlow<String> = _username.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _loginState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val loginState: StateFlow<LoginUiState> = _loginState.asStateFlow()

    // --- Dependencies --- 
    // Use the shared ApiService instance (Replace with DI later)
    private val service: ApiService = ReferenceDbViewModel.apiService

    // --- Event Handlers --- 
    fun onUsernameChange(input: String) {
        _username.value = input
         // Reset state if user modifies input after an error/success
        if (_loginState.value !is LoginUiState.Idle && _loginState.value !is LoginUiState.Loading) {
             _loginState.value = LoginUiState.Idle
        }
    }

    fun onPasswordChange(input: String) {
        _password.value = input
         // Reset state if user modifies input after an error/success
         if (_loginState.value !is LoginUiState.Idle && _loginState.value !is LoginUiState.Loading) {
             _loginState.value = LoginUiState.Idle
        }
    }

    fun canAttemptLogin(): Boolean {
         // Simple validation: ensure username and password are not blank
        return username.value.isNotBlank() && password.value.isNotBlank()
    }

    // --- Actions --- 
    fun attemptLogin() {
        if (!canAttemptLogin()) {
             _loginState.value = LoginUiState.Error("Username and password cannot be empty.")
            return
        }
        if (_loginState.value == LoginUiState.Loading) return // Prevent multiple simultaneous logins

        _loginState.value = LoginUiState.Loading
        val credentials = LoginCredentials(username.value.trim(), password.value)

        viewModelScope.launch {
            try {
                val response = service.login(credentials)

                if (response.isSuccessful) {
                    val loginResponse = response.body()
                    if (loginResponse != null) {
                         // Login successful!
                         // The cookie should be stored automatically by the CookieJar
                         println("Login Successful: User ${loginResponse.username} (ID: ${loginResponse.userId})")
                        _loginState.value = LoginUiState.Success(loginResponse)
                        // The UI layer should observe this and navigate away
                    } else {
                        // Should not happen with a successful response unless API is malformed
                         println("Login Error: Server returned success but empty body.")
                        _loginState.value = LoginUiState.Error("Login failed: Empty server response.")
                    }
                } else {
                     // Handle non-2xx responses
                    val errorMsg = when (response.code()) {
                        401 -> "Invalid username or password."
                        else -> "Login failed (Code: ${response.code()})."
                    }
                     println("Login Error: ${response.code()} - ${response.errorBody()?.string()}")
                    _loginState.value = LoginUiState.Error(errorMsg)
                }
            } catch (e: HttpException) {
                 println("Login Network/HTTP Error: ${e.message()}")
                 _loginState.value = LoginUiState.Error("Network error during login.")
                 e.printStackTrace()
            } catch (e: Throwable) {
                 println("Login Generic Error: ${e.message}")
                 _loginState.value = LoginUiState.Error("An unexpected error occurred during login.")
                 e.printStackTrace()
            }
        }
    }
} 