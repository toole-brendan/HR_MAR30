import SwiftUI

struct ScanView: View {
    // Use @StateObject because this View owns the ViewModel
    @StateObject private var viewModel = ScanViewModel()
    
    // Keep isScanning state local to control the CameraView representation
    // This is needed because the CameraView itself needs a binding to control start/stop
    @State private var isScanningActive: Bool = true 
    @State private var showingUserSelection = false // State for sheet presentation

    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView { 
            ZStack {
                // Camera View takes up the background
                // Bind CameraView's scannedCode to the ViewModel's property
                // Bind isScanning to the local isScanningActive state
                CameraView(scannedCode: $viewModel.scannedCodeFromCamera, isScanning: $isScanningActive)
                    .edgesIgnoringSafeArea(.all)
                    .onChange(of: viewModel.scanState) { newState in
                        // Stop the camera preview if we are no longer in the scanning state
                        if case .scanning = newState {
                            isScanningActive = true
                        } else {
                            isScanningActive = false
                        }
                    }

                // Overlay UI elements based on ViewModel state
                ScanStatusOverlay(
                    scanState: viewModel.scanState, 
                    onScanAgain: { viewModel.scanAgain() },
                    onConfirm: { property in
                         print("Confirm tapped for property: \(property.id)")
                         // Present the user selection sheet
                         showingUserSelection = true
                    }
                )
                 
                 // Display transfer request status/error
                 TransferStatusMessage(state: viewModel.transferRequestState)

            }
            .navigationTitle("Scan Item")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(leading: Button("Cancel") { 
                 viewModel.scanAgain() // Reset state if cancelling mid-process
                 isScanningActive = false // Ensure camera stops
                 presentationMode.wrappedValue.dismiss() 
             })
             .onAppear { // Ensure scanning starts when view appears
                 isScanningActive = true
                 if viewModel.scanState != .scanning { // Reset state if returning to view
                      viewModel.scanAgain()
                 }
             }
             .onDisappear { // Stop scanning when view disappears
                 isScanningActive = false
             }
             // Present UserSelectionView as a sheet
             .sheet(isPresented: $showingUserSelection) {
                 UserSelectionView(onUserSelected: { selectedUser in
                     print("User selected: \(selectedUser.username)")
                     viewModel.initiateTransfer(targetUser: selectedUser)
                     // Sheet dismisses automatically after selection in UserSelectionView
                 })
             }
        }
    }
}

// Separate Overlay View for clarity
struct ScanStatusOverlay: View {
    let scanState: ScanState
    let onScanAgain: () -> Void
    let onConfirm: (Property) -> Void // Add confirmation callback

    var body: some View {
        VStack {
            Spacer() // Push content to the bottom

            Group { // Group helps apply modifiers commonly
                switch scanState {
                case .scanning:
                    Text("Point camera at barcode or serial number")
                        .padding()
                        .background(Color.black.opacity(0.7))
                        .foregroundColor(.white)
                        .cornerRadius(10)

                case .loading:
                     ProgressView("Looking up item...") // Use ProgressView for loading
                        .padding()
                        .background(.thinMaterial) // Use material background
                        .foregroundColor(Color.primary)
                        .cornerRadius(10)

                case .success(let property):
                    PropertyDetailsCard(property: property)
                     Spacer().frame(height: 10)
                     
                     HStack(spacing: 20) { // Use HStack for buttons
                         Button("Confirm") {
                            print("Confirm button clicked for: \(property.serialNumber)")
                            onConfirm(property)
                            // TODO: Implement actual confirmation action
                         }
                         .buttonStyle(.borderedProminent) // Make confirm prominent
                         
                         Button("Scan Again") {
                            onScanAgain()
                         }
                         .buttonStyle(.bordered) // Keep scan again less prominent
                     }

                case .notFound:
                    Text("Item not found in database.")
                        .padding()
                        .background(Color.orange.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                     Spacer().frame(height: 10)
                     Button("Scan Again") {
                        onScanAgain()
                    }
                     .buttonStyle(.bordered)

                case .error(let message):
                    Text("Error: \(message)")
                        .padding()
                        .background(Color.red.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                     Spacer().frame(height: 10)
                     Button("Try Again") {
                        onScanAgain()
                    }
                     .buttonStyle(.bordered)
                }
            }
            .padding(.bottom) // Add padding below the status content
        }
        .padding() // Add padding around the VStack contents
    }
}

// Simple Card View (matches Android version conceptually)
struct PropertyDetailsCard: View {
    let property: Property

    var body: some View {
        VStack(alignment: .leading) {
            Text("Item Found")
                .font(.headline)
            Divider()
            Text("NSN: \(property.nsn)")
            Text("Name: \(property.itemName)")
            Text("Serial Number: \(property.serialNumber)")
            Text("Status: \(property.status)")
            // Add more details...
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.regularMaterial) // Use material background
        .cornerRadius(10)
    }
}

// Separate view for overlaying transfer status/errors
struct TransferStatusMessage: View {
    let state: ScanViewModel.TransferRequestState
    
    var body: some View {
        VStack {
            Spacer() // Push to bottom
            Group { // Remove <AnyView> and internal AnyView wrappers
                 switch state {
                 case .loading:
                      ProgressView("Requesting Transfer...")
                         .padding()
                         .background(.regularMaterial)
                         .cornerRadius(10)
                 case .success(let transfer):
                     Text("Transfer Requested Successfully! (ID: \(transfer.id))")
                         .padding()
                         .background(Color.green.opacity(0.8))
                         .foregroundColor(.white)
                         .cornerRadius(10)
                 case .error(let message):
                      Text("Transfer Error: \(message)")
                         .padding()
                         .background(Color.red.opacity(0.8))
                         .foregroundColor(.white)
                         .cornerRadius(10)
                 case .idle:
                     EmptyView()
                 }
             }
             // Add transition for smoother appearance/disappearance
            .transition(.opacity.combined(with: .scale(scale: 0.8)))
         }
         .padding(.bottom, 80) // Adjust padding as needed
         .animation(.easeInOut, value: state) // Animate changes based on state
     }
 }

struct ScanView_Previews: PreviewProvider {
    static var previews: some View {
        ScanView()
    }
} 