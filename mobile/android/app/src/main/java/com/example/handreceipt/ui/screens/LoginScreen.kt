package com.example.handreceipt.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.handreceipt.viewmodels.LoginUiState
import com.example.handreceipt.viewmodels.LoginViewModel
import com.example.handreceipt.data.model.LoginResponse // For success callback

@Composable
fun LoginScreen(
    viewModel: LoginViewModel = viewModel(),
    onLoginSuccess: (LoginResponse) -> Unit // Callback after successful login
) {
    val username by viewModel.username.collectAsStateWithLifecycle()
    val password by viewModel.password.collectAsStateWithLifecycle()
    val loginState by viewModel.loginState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    var passwordVisible by rememberSaveable { mutableStateOf(false) }
    
    // Navigate away when login is successful
    LaunchedEffect(loginState) {
        if (loginState is LoginUiState.Success) {
            focusManager.clearFocus() // Clear focus before navigating
            // Show a brief success message (optional)
            // Toast.makeText(context, "Login Successful!", Toast.LENGTH_SHORT).show()
            onLoginSuccess((loginState as LoginUiState.Success).response)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp)
            .verticalScroll(rememberScrollState()), // Allow scrolling if content overflows
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        Text("HandReceipt Login", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(32.dp))

        // Username Field
        OutlinedTextField(
            value = username,
            onValueChange = viewModel::onUsernameChange,
            label = { Text("Username") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Text,
                imeAction = ImeAction.Next
            ),
            isError = loginState is LoginUiState.Error // Show error state
        )
        Spacer(modifier = Modifier.height(16.dp))

        // Password Field
        OutlinedTextField(
            value = password,
            onValueChange = viewModel::onPasswordChange,
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(
                onDone = { 
                    focusManager.clearFocus()
                    if (viewModel.canAttemptLogin()) {
                         viewModel.attemptLogin() 
                    }
                }
            ),
             // Toggle password visibility
             trailingIcon = {
                val image = if (passwordVisible)
                    Icons.Filled.Visibility
                else Icons.Filled.VisibilityOff
                 val description = if (passwordVisible) "Hide password" else "Show password"

                 IconButton(onClick = {passwordVisible = !passwordVisible}){
                    Icon(imageVector  = image, description)
                }
            },
            isError = loginState is LoginUiState.Error // Show error state
        )
        Spacer(modifier = Modifier.height(8.dp))

        // Display Error Message
         if (loginState is LoginUiState.Error) {
             Text(
                 text = (loginState as LoginUiState.Error).message,
                 color = MaterialTheme.colorScheme.error,
                 style = MaterialTheme.typography.bodySmall,
                 modifier = Modifier.align(Alignment.Start)
            )
             Spacer(modifier = Modifier.height(8.dp)) // Space between error and button
        } else {
             Spacer(modifier = Modifier.height(16.dp)) // Maintain space when no error
         }


        // Login Button
        Button(
            onClick = {
                 focusManager.clearFocus()
                 viewModel.attemptLogin()
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = loginState !is LoginUiState.Loading && viewModel.canAttemptLogin()
        ) {
            if (loginState is LoginUiState.Loading) {
                CircularProgressIndicator(
                     modifier = Modifier.size(24.dp),
                     color = MaterialTheme.colorScheme.onPrimary,
                     strokeWidth = 2.dp
                )
            } else {
                 Text("Login")
            }
        }
        
         // TODO: Add elements for registration or password recovery if needed
        /*
         TextButton(onClick = { /* Navigate to registration */ }) {
             Text("Don't have an account? Sign up")
         }
         */
    }
}

// Add previews if desired
/*
@Preview(showBackground = true)
@Composable
fun LoginScreenPreviewIdle() {
     // Need Theme wrapper
     LoginScreen(onLoginSuccess = {})
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreviewLoading() {
     // Need Theme wrapper & mock ViewModel state
     LoginScreen(onLoginSuccess = {})
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreviewError() {
     // Need Theme wrapper & mock ViewModel state
     LoginScreen(onLoginSuccess = {})
}
*/ 