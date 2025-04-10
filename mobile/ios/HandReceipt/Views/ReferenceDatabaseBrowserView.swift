import SwiftUI

// REMOVE Placeholder Data Models and ViewModel - they are now in separate files
// struct ReferenceCategory: Identifiable { ... } // REMOVED
// struct ReferenceItem: Identifiable { ... } // REMOVED
// @MainActor class ReferenceDBViewModel: ObservableObject { ... } // REMOVED

struct ReferenceDatabaseBrowserView: View {
    @StateObject private var viewModel = ReferenceDBViewModel()
    
    // Callbacks defined in MainAppView / ContentView
    var onItemConfirmed: (Property) -> Void // Placeholder, may not be used here
    var onNavigateToManualEntry: () -> Void // Action to trigger showing the sheet

    var body: some View {
         // The NavigationView is now provided by MainAppView
         // NavigationView { // REMOVED NavigationView wrapper from here
            VStack {
                // REMOVE Search Bar for now
                // TextField("Search by Name or NSN", text: $viewModel.searchQuery) ... // REMOVED

                if viewModel.isLoading {
                    ProgressView("Loading Items...")
                        .padding()
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
                                // Use NavigationLink to push the detail view
                                NavigationLink {
                                     ReferenceItemDetailView(item: item)
                                } label: {
                                    // Label for the row in the list
                                     ReferenceItemRow(item: item)
                                }
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                     // Add refresh control if needed (can stay)
                    .refreshable {
                        viewModel.loadReferenceItems()
                    }
                }
                 Spacer() // Keep spacer if needed for layout within VStack
            }
            .navigationTitle("Reference Database")
            .onAppear {
                if viewModel.referenceItems.isEmpty {
                    viewModel.loadReferenceItems()
                }
            }
             // Toolbar is now handled by MainAppView
             // .toolbar { ... } // REMOVED Toolbar definition from here
         // } // REMOVED NavigationView wrapper end bracket
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

// Keep Placeholder Detail View (ensure it uses the correct ReferenceItem model properties)
struct ReferenceItemDetailView: View {
    let item: ReferenceItem // This should now use the model from Models/ReferenceItem.swift

    var body: some View {
        ScrollView { // Use ScrollView for potentially long content
            VStack(alignment: .leading) {
                // TODO: Add Image loading using item.imageUrl if available
                 if let imageUrlString = item.imageUrl, let url = URL(string: imageUrlString) {
                     AsyncImage(url: url) { phase in
                         switch phase {
                         case .empty:
                             ProgressView()
                                 .frame(height: 200)
                         case .success(let image):
                             image.resizable()
                                  .aspectRatio(contentMode: .fit)
                                  .frame(maxWidth: .infinity) // Adjust frame as needed
                                  .padding(.bottom)
                         case .failure:
                             Image(systemName: "photo.fill") // Placeholder for failure
                                 .resizable()
                                 .aspectRatio(contentMode: .fit)
                                 .frame(maxWidth: .infinity, maxHeight: 200)
                                 .foregroundColor(.gray)
                                 .padding(.bottom)
                         @unknown default:
                             EmptyView()
                         }
                     }
                      .frame(height: 200) // Give AsyncImage a frame
                 } else {
                      Image(systemName: "photo.fill") // Placeholder if no URL
                         .resizable()
                         .aspectRatio(contentMode: .fit)
                         .frame(maxWidth: .infinity, maxHeight: 200)
                         .foregroundColor(.gray)
                         .padding(.bottom)
                 }

                Text(item.itemName).font(.largeTitle).padding(.bottom, 5) // Use itemName
                Text("NSN: \(item.nsn)").font(.title2).foregroundColor(.secondary)

                Divider().padding(.vertical)

                // Display optional fields safely
                if let description = item.description, !description.isEmpty {
                    Text("Description").font(.headline).padding(.bottom, 2)
                    Text(description)
                    Divider().padding(.vertical)
                }

                if let manufacturer = item.manufacturer, !manufacturer.isEmpty {
                    Text("Manufacturer").font(.headline).padding(.bottom, 2)
                    Text(manufacturer)
                    Divider().padding(.vertical)
                }

                // Add more fields from ReferenceItem model here as needed

                Spacer() // Push content to top
            }
            .padding()
        }
        .navigationTitle(item.itemName) // Use itemName
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ReferenceDatabaseBrowserView_Previews: PreviewProvider {
    static var previews: some View {
         // Wrap in NavigationView for previewing NavigationLink behavior
        NavigationView {
             ReferenceDatabaseBrowserView(onItemConfirmed: {_ in}, onNavigateToManualEntry: {})
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