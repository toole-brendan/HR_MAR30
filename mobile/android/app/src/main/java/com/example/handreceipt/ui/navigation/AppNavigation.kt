package com.example.handreceipt.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.handreceipt.ui.screens.LoginScreen
import com.example.handreceipt.ui.screens.ManualSNEntryScreen
import com.example.handreceipt.ui.screens.ReferenceDatabaseBrowserScreen
import com.example.handreceipt.ui.screens.ReferenceItemDetailScreen
import com.example.handreceipt.data.model.getExampleReferenceItem // For preview/placeholder detail
import com.example.handreceipt.data.model.ReferenceItem // Needed for detail args
import java.util.UUID // If UUID is used for IDs

// Define navigation routes as constants
object Routes {
    const val LOGIN = "login"
    const val REF_DB_BROWSER = "refDbBrowser"
    const val MANUAL_SN_ENTRY = "manualSnEntry"
    // Route for detail screen, taking itemId as an argument
    const val REF_ITEM_DETAIL = "refItemDetail/{itemId}" 
    
    // Helper function to create the route with the argument value
    fun refItemDetail(itemId: String) = "refItemDetail/$itemId"
}

@Composable
fun AppNavigation(navController: NavHostController = rememberNavController()) {
    
    NavHost(navController = navController, startDestination = Routes.LOGIN) {
        
        // Login Screen
        composable(Routes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    // Navigate to the main screen (Ref DB Browser) after login
                    // Pop Login off the back stack so user can't go back to it
                     println("Navigating from Login to Ref DB Browser")
                    navController.navigate(Routes.REF_DB_BROWSER) {
                        popUpTo(Routes.LOGIN) {
                            inclusive = true
                        }
                         // Avoid multiple copies of the main screen on top
                         launchSingleTop = true 
                    }
                }
            )
        }
        
        // Reference Database Browser Screen
        composable(Routes.REF_DB_BROWSER) {
            ReferenceDatabaseBrowserScreen(
                 // Navigate to the detail screen, passing the item's ID
                 onItemSelected = { itemId -> 
                     println("Navigating from Ref DB Browser to Detail: $itemId")
                     navController.navigate(Routes.refItemDetail(itemId))
                 },
                 // Example navigation to Manual SN Entry (e.g., from a FAB or menu)
                 onNavigateToManualEntry = { 
                      println("Navigating from Ref DB Browser to Manual SN Entry")
                     navController.navigate(Routes.MANUAL_SN_ENTRY)
                 }
                 // onNavigateBack = { navController.popBackStack() } // Add if nested
            )
        }
        
        // Manual Serial Number Entry Screen
        composable(Routes.MANUAL_SN_ENTRY) {
            ManualSNEntryScreen(
                 // Define what happens when an item is confirmed (e.g., go back, go somewhere else)
                 onItemConfirmed = { property ->
                     println("Item confirmed in Manual SN Entry: ${property.serialNumber}, navigating back.")
                     // Example: Just navigate back after confirmation
                     navController.popBackStack()
                 },
                 onNavigateBack = { 
                      println("Navigating back from Manual SN Entry")
                     navController.popBackStack() 
                 }
            )
        }
        
        // Reference Item Detail Screen
         composable(
             route = Routes.REF_ITEM_DETAIL,
             arguments = listOf(navArgument("itemId") { type = NavType.StringType }) 
         ) { backStackEntry ->
             // Retrieve the itemId argument
             val itemId = backStackEntry.arguments?.getString("itemId")
             
             // TODO: Fetch the actual ReferenceItem details based on itemId
             // For now, using placeholder/example data if ID matches example
              val itemToShow: ReferenceItem = if (itemId == getExampleReferenceItem().id.toString()) { 
                 getExampleReferenceItem()
             } else {
                 // Create a placeholder or show error state if item can't be fetched
                 println("Warning: Could not find item for ID: $itemId, showing placeholder.")
                 ReferenceItem(id = UUID.randomUUID(), nsn="N/A", itemName="Item Not Found", description = null, manufacturer = null, imageUrl = null)
             }

            ReferenceItemDetailScreen(
                 item = itemToShow, 
                 onNavigateBack = { 
                     println("Navigating back from Ref Item Detail")
                     navController.popBackStack() 
                 }
            )
        }
    }
} 