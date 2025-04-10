import SwiftUI

struct ScanView: View {
    @StateObject private var viewModel = ScanViewModel()

    var body: some View {
        NavigationView { // Keep NavigationView for title consistency
            VStack {
                Text("Scanning Interface Placeholder")
                    .font(.title)
                
                // TODO: Add Camera View / Scanning UI here
                 Spacer()
                 Button("Simulate Scan (SN123)") {
                     viewModel.processScannedCode("SN123")
                 }
                 .buttonStyle(.bordered)
                 Spacer()
            }
            .navigationTitle("Scan")
        }
    }
}

struct ScanView_Previews: PreviewProvider {
    static var previews: some View {
        ScanView()
    }
} 