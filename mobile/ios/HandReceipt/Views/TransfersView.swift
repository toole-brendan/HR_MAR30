import SwiftUI

struct TransfersView: View {
    // Inject AuthViewModel to get current user ID
    @StateObject private var authViewModel = AuthViewModel()
    // Initialize TransfersViewModel with the current user ID
    @StateObject private var viewModel: TransfersViewModel

    // Initializer to inject current user ID
    init() {
        // Temporarily create AuthViewModel here to get ID. Ideally, AuthViewModel would be an EnvironmentObject.
        let authVM = AuthViewModel()
        let initialViewModel = TransfersViewModel(currentUserId: authVM.currentUser?.userId)
        _viewModel = StateObject(wrappedValue: initialViewModel)
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 0) { // Use VStack to hold Pickers and List
                filterControls // Extracted filter controls
                listContent // Extracted list content
            }
            .navigationTitle("Transfers")
            .toolbar {
                 ToolbarItem(placement: .navigationBarTrailing) {
                      Button {
                          viewModel.fetchTransfers()
                      } label: {
                          Label("Refresh", systemImage: "arrow.clockwise")
                      }
                      .disabled(viewModel.loadingState == TransfersViewModel.LoadingState.loading)
                  }
              }
        }
    }

    // Extracted view for filter controls
    private var filterControls: some View {
        VStack {
            Picker("Direction", selection: $viewModel.selectedDirectionFilter) {
                ForEach(TransfersViewModel.FilterDirection.allCases) {
                    direction in
                    Text(direction.rawValue).tag(direction)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.top)

            Picker("Status", selection: $viewModel.selectedStatusFilter) {
                 ForEach(TransfersViewModel.FilterStatus.allCases) {
                    status in
                    Text(status.rawValue).tag(status)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
    }

    // Extracted view for the main list content or status messages
    private var listContent: some View {
        ZStack {
            Group {
                switch viewModel.loadingState {
                case .idle:
                    Text("Select filters to load transfers.")
                        .foregroundColor(.gray)
                case .loading:
                    ProgressView()
                case .success(let transfers):
                    if viewModel.filteredTransfers.isEmpty {
                        Text("No transfers found matching filters.")
                            .foregroundColor(.gray)
                    } else {
                        List {
                            ForEach(viewModel.filteredTransfers) {
                                transfer in
                                NavigationLink(destination: TransferDetailView(transfer: transfer, viewModel: viewModel)) {
                                    TransferListItemView(transfer: transfer)
                                }
                            }
                        }
                        .listStyle(PlainListStyle())
                        .refreshable {
                             viewModel.fetchTransfers()
                         }
                    }
                case .error(let message):
                    ErrorStateView(message: message) {
                        viewModel.fetchTransfers()
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Overlay for Action State (Success/Error Messages)
            ActionStatusOverlay(state: viewModel.actionState)
        }
    }
}

// Separate view for list item presentation
struct TransferListItemView: View {
    let transfer: Transfer

    // Use a Formatter for dates
    private static var dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter
    }()

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Item: \(transfer.propertyName ?? transfer.propertySerialNumber)")
                    .font(.headline)
                Text("SN: \(transfer.propertySerialNumber)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                 Text("From: \(transfer.fromUser?.username ?? "Unknown")")
                 Text("To: \(transfer.toUser?.username ?? "Unknown")")
                 Text("Requested: \(transfer.requestTimestamp, formatter: Self.dateFormatter)")
            }
            Spacer()
            Text(transfer.status.rawValue)
                .font(.caption)
                .padding(4)
                .background(statusColor(transfer.status))
                .foregroundColor(.white)
                .cornerRadius(4)
        }
    }

    // Helper to get status color
    private func statusColor(_ status: TransferStatus) -> Color {
        switch status {
        case .PENDING: return .orange
        case .APPROVED: return .green
        case .REJECTED: return .red
        case .CANCELLED: return .gray
        case .UNKNOWN: return .purple
        }
    }
}

// Placeholder for the Detail View
struct TransferDetailView: View {
    let transfer: Transfer
    @ObservedObject var viewModel: TransfersViewModel

    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(alignment: .leading) {
            Text("Transfer Details")
                .font(.title)
                .padding(.bottom)

            TransferListItemView(transfer: transfer)
                .padding(.bottom)

            Spacer()

            // Action Buttons Section
            if transfer.status == .PENDING && transfer.toUserId == viewModel.currentUserId {
                HStack {
                     Button("Approve") {
                        viewModel.approveTransfer(transferId: transfer.id)
                     }
                     .buttonStyle(.borderedProminent)
                     .tint(.green)
                     .disabled(viewModel.actionState == .loading)

                     Button("Reject") {
                         viewModel.rejectTransfer(transferId: transfer.id)
                     }
                     .buttonStyle(.borderedProminent)
                     .tint(.red)
                     .disabled(viewModel.actionState == .loading)
                 }
                 .padding()

                 // Show loading specifically for actions
                if viewModel.actionState == .loading {
                    ProgressView()
                        .padding(.top)
                }
             }

            Spacer()
        }
        .padding()
        .navigationTitle("Transfer #\(transfer.id)")
            .navigationBarTitleDisplayMode(.inline)
    }
}

// New Overlay View for Action Status
struct ActionStatusOverlay: View {
    let state: TransfersViewModel.ActionState

    var body: some View {
        VStack {
             Spacer() // Push to bottom or center as desired
             Group {
                switch state {
                case .idle, .loading:
                    EmptyView()
                case .success(let message):
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text(message)
                    }
                    .padding()
                    .background(.thinMaterial)
                    .cornerRadius(10)
                    .transition(.opacity.combined(with: .scale(scale: 0.8)))
                case .error(let message):
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.red)
                        Text(message)
                            .lineLimit(2)
                    }
                    .padding()
                    .background(.thinMaterial)
                    .cornerRadius(10)
                    .transition(.opacity.combined(with: .scale(scale: 0.8)))
                }
             }
             .padding(.bottom, 30) // Adjust position
         }
         .animation(.spring(), value: state)
    }
}

struct TransfersView_Previews: PreviewProvider {
    static var previews: some View {
        // Adjust previews if needed, potentially mocking AuthViewModel or currentUserId
        TransfersView()
    }
} 