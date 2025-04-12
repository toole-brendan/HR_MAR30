import SwiftUI

// REMOVE Placeholder Data Models and ViewModel - they are now in separate files
// struct ReferenceCategory: Identifiable { ... } // REMOVED
// struct ReferenceItem: Identifiable { ... } // REMOVED
// @MainActor class ReferenceDBViewModel: ObservableObject { ... } // REMOVED

struct ReferenceDatabaseBrowserView: View {
    @StateObject private var viewModel = ReferenceDBViewModel()
    
    // State to control sheet presentation for Manual SN Entry
    @State private var showingManualSNEntry = false

    var body: some View {
         // Wrap the content in a NavigationView to enable navigation links
         NavigationView {
            VStack {
                // Search Bar (Optional - can be added later)
                // TextField("Search...", text: $viewModel.searchQuery)

                if viewModel.isLoading {
                    ProgressView("Loading Items...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = viewModel.errorMessage {
                    VStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 50, height: 50)
                            .foregroundColor(.orange)
                        Text("Error Loading Data")
                            .font(.headline)
                            .padding(.top, 5)
                        Text(errorMessage)
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        Button("Retry") {
                            viewModel.loadReferenceItems()
                        }
                        .padding(.top)
                        .buttonStyle(.bordered)
                    }
                    .padding()
                } else {
                    List {
                        if viewModel.referenceItems.isEmpty {
                            Text("No reference items found.")
                                .foregroundColor(.gray)
                        } else {
                            ForEach(viewModel.referenceItems) { item in
                                // NavigationLink now points to the new detail view
                                NavigationLink {
                                    // Pass the item's ID (assuming it's a String)
                                     ReferenceItemDetailView(itemId: item.id.uuidString)
                                } label: {
                                     ReferenceItemRow(item: item)
                                }
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                    .refreshable {
                        viewModel.loadReferenceItems()
                    }
                }
                 Spacer()
            }
            .navigationTitle("Reference Database")
            .toolbar { // Add toolbar items here
                 ToolbarItem(placement: .navigationBarTrailing) {
                     Button {
                         showingManualSNEntry = true // Show the Manual SN Entry sheet
                     } label: {
                         Image(systemName: "plus.magnifyingglass")
                         Text("Enter SN")
                     }
                 }
                 // Add other toolbar items if needed (e.g., Filter)
            }
            .sheet(isPresented: $showingManualSNEntry) { // Present Manual SN Entry as a sheet
                 NavigationView { // Embed ManualSNEntryView in its own NavigationView for title/toolbar
                     ManualSNEntryView(
                        onItemConfirmed: { property in
                            // Handle confirmed item if needed (e.g., show confirmation)
                             print("Item confirmed from sheet: \(property.serialNumber)")
                            showingManualSNEntry = false // Dismiss sheet
                        }
                     )
                 }
            }
            .onAppear {
                // Load items only if the list is currently empty
                if viewModel.referenceItems.isEmpty {
                    viewModel.loadReferenceItems()
                }
            }
         } // End NavigationView
    }
}

// Row View for the Reference Item List
struct ReferenceItemRow: View {
    let item: ReferenceItem
    
    var body: some View {
        HStack {
             // Optional: Thumbnail Image using AsyncImage
             AsyncImage(url: URL(string: item.imageUrl ?? "")) { phase in
                 if let image = phase.image {
                     image.resizable()
                          .aspectRatio(contentMode: .fill)
                          .frame(width: 40, height: 40)
                          .clipShape(RoundedRectangle(cornerRadius: 4))
                 } else if phase.error != nil {
                     Image(systemName: "photo.fill") // Error placeholder
                          .foregroundColor(.gray)
                         .frame(width: 40, height: 40)
                 } else {
                     Image(systemName: "photo") // Loading placeholder
                         .foregroundColor(.secondary)
                         .frame(width: 40, height: 40)
                 }
             }
             .padding(.trailing, 5)
            
            VStack(alignment: .leading) {
                Text(item.itemName).font(.headline)
                Text("NSN: \(item.nsn)").font(.subheadline).foregroundColor(.gray)
            }
        }
    }
}

// Keep Placeholder Detail View (ensure it uses the correct ReferenceItem model properties) - DEFINITION REMOVED
// struct ReferenceItemDetailView: View {
//     // ... Contents removed ... 
// }

struct ReferenceDatabaseBrowserView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            // Remove callbacks from preview initializer
             ReferenceDatabaseBrowserView()
        }
        .previewDisplayName("Browser View")
    }
}

// Add a MockAPIService for Previews (optional but recommended)
/*
class MockAPIService: APIServiceProtocol {
    var mockItems: [ReferenceItem]?
    var shouldThrowError = false
    var simulatedDelay: TimeInterval = 0.5 // Simulate network delay

    func fetchReferenceItems() async throws -> [ReferenceItem] {
        try await Task.sleep(nanoseconds: UInt64(simulatedDelay * 1_000_000_000))

        if shouldThrowError {
            throw APIService.APIError.serverError(statusCode: 500)
        }
        return mockItems ?? []
    }
}
*/ 