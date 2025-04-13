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
        configureSegmentedControlAppearance() // Configure segmented controls
    }

    var body: some View {
        VStack(spacing: 0) { // Use VStack to hold Pickers and List
            filterControls // Extracted filter controls
            listContent // Extracted list content
        }
        .background(AppColors.appBackground.ignoresSafeArea()) // Set background
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
        .onAppear { // Re-apply on appear if needed
            configureSegmentedControlAppearance()
        }
    }

    // Configure Segmented Control Appearance
    private func configureSegmentedControlAppearance() {
        let appearance = UISegmentedControl.appearance()
        appearance.backgroundColor = UIColor(AppColors.appBackground) // Match app background
        appearance.selectedSegmentTintColor = UIColor(AppColors.accent)
        
        let normalFont = AppFonts.uiFont(from: AppFonts.caption) ?? .systemFont(ofSize: 13)
        let selectedFont = AppFonts.uiFont(from: AppFonts.captionMedium) ?? .systemFont(ofSize: 13, weight: .medium)
        
        appearance.setTitleTextAttributes([
            .foregroundColor: UIColor(AppColors.secondaryText),
            .font: normalFont
        ], for: .normal)
        appearance.setTitleTextAttributes([
            .foregroundColor: UIColor(AppColors.primaryText), // Use primary text on accent bg
            .font: selectedFont
        ], for: .selected)
    }

    // Extracted view for filter controls
    private var filterControls: some View {
        VStack(spacing: 10) { // Added spacing
            Picker("Direction", selection: $viewModel.selectedDirectionFilter) {
                ForEach(TransfersViewModel.FilterDirection.allCases) {
                    direction in
                    Text(direction.rawValue).tag(direction)
                }
            }
            .pickerStyle(.segmented)

            Picker("Status", selection: $viewModel.selectedStatusFilter) {
                 ForEach(TransfersViewModel.FilterStatus.allCases) {
                    status in
                    Text(status.rawValue).tag(status)
                }
            }
            .pickerStyle(.segmented)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(AppColors.secondaryBackground) // Use secondary bg for filter area
    }

    // Extracted view for the main list content or status messages
    private var listContent: some View {
        ZStack {
            AppColors.appBackground.ignoresSafeArea() // Ensure background

            Group {
                switch viewModel.loadingState {
                case .idle:
                    Text("Select filters to view transfers.")
                        .font(AppFonts.body)
                        .foregroundColor(AppColors.secondaryText)
                        .padding()
                case .loading:
                    ProgressView {
                        Text("Loading transfers...")
                            .font(AppFonts.body)
                            .foregroundColor(AppColors.secondaryText)
                    }
                    .progressViewStyle(CircularProgressViewStyle(tint: AppColors.accent))
                case .success(_):
                    if viewModel.filteredTransfers.isEmpty {
                        Text("No transfers found matching filters.")
                            .font(AppFonts.body)
                            .foregroundColor(AppColors.secondaryText)
                            .padding()
                    } else {
                        List {
                            ForEach(viewModel.filteredTransfers) { transfer in
                                ZStack {
                                    NavigationLink(destination: TransferDetailView(transfer: transfer, viewModel: viewModel)
                                                       .navigationBarTitleDisplayMode(.inline)) {
                                        EmptyView()
                                    }
                                    .opacity(0)
                                    
                                    TransferListItemView(transfer: transfer)
                                }
                                .listRowInsets(EdgeInsets()) // Remove default padding
                                .padding(.horizontal) // Apply standard horizontal padding
                                .padding(.vertical, 8) // Apply custom vertical padding
                                .listRowBackground(AppColors.secondaryBackground) // Use secondary bg for rows
                                .listRowSeparator(.hidden) // Hide separators
                            }
                        }
                        .listStyle(.plain)
                        // .scrollContentBackground(.hidden) // List bg is transparent - Removed for iOS < 16 compatibility
                        // Background set by ZStack parent
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
        formatter.timeStyle = .none // Keep it short
        return formatter
    }()

    var body: some View {
        HStack(alignment: .center, spacing: 12) { // Added spacing
            VStack(alignment: .leading, spacing: 4) {
                Text(transfer.propertyName ?? "Unknown Item")
                    .font(AppFonts.bodyBold) // Themed font
                    .foregroundColor(AppColors.primaryText)
                Text("SN: \(transfer.propertySerialNumber)")
                    .font(AppFonts.caption) // Themed font
                    .foregroundColor(AppColors.secondaryText)
                Text("From: \(transfer.fromUser?.username ?? "N/A")") // Use username
                    .font(AppFonts.caption) // Themed font
                    .foregroundColor(AppColors.secondaryText)
                Text("To: \(transfer.toUser?.username ?? "N/A")") // Use username
                    .font(AppFonts.caption) // Themed font
                    .foregroundColor(AppColors.secondaryText)
                Text("Req: \(transfer.requestTimestamp, formatter: Self.dateFormatter)")
                    .font(AppFonts.caption) // Themed font
                    .foregroundColor(AppColors.secondaryText.opacity(0.8))
            }
            Spacer()
            // Status Badge
            Text(transfer.status.rawValue.capitalized)
                .font(AppFonts.captionMedium) // Themed font
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .foregroundColor(statusForegroundColor(transfer.status)) // Dynamic themed text color
                .background(statusBackgroundColor(transfer.status)) // Dynamic themed background color
                .clipShape(Capsule())
        }
        // Background handled by list row background
    }

    // Helpers for status badge colors (themed)
    private func statusBackgroundColor(_ status: TransferStatus) -> Color {
        switch status {
            case .PENDING: return Color.orange.opacity(0.2)
            case .APPROVED: return AppColors.accent.opacity(0.2) // Use accent for approved
            case .REJECTED: return AppColors.destructive.opacity(0.2)
            case .CANCELLED: return AppColors.secondaryText.opacity(0.2)
            case .UNKNOWN: return AppColors.secondaryText.opacity(0.1)
        }
    }
    
    private func statusForegroundColor(_ status: TransferStatus) -> Color {
        switch status {
            case .PENDING: return Color.orange
            case .APPROVED: return AppColors.accent // Use accent for approved
            case .REJECTED: return AppColors.destructive
            case .CANCELLED: return AppColors.secondaryText
            case .UNKNOWN: return AppColors.secondaryText.opacity(0.7)
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
            // Use List for better structure and spacing?
            ScrollView { // Wrap in ScrollView if content might exceed screen height
                VStack(alignment: .leading, spacing: 16) { // Added spacing
                    Text("Item Details")
                        .font(AppFonts.headline) // Themed font
                        .foregroundColor(AppColors.secondaryText)
                    TransferListItemView(transfer: transfer)
                        .padding(.bottom)

                    Divider().background(AppColors.secondaryText.opacity(0.3))

                    // Additional Details
                    Text("Additional Info")
                        .font(AppFonts.headline)
                        .foregroundColor(AppColors.secondaryText)
                    if let approvalDate = transfer.approvalTimestamp {
                        detailRow(label: "Action Date", value: approvalDate.formatted(date: .abbreviated, time: .shortened))
                    }
                    // Add more details here (e.g., User Ranks/Full Names)
                     detailRow(label: "From Rank", value: transfer.fromUser?.rank ?? "N/A")
                     detailRow(label: "To Rank", value: transfer.toUser?.rank ?? "N/A")
                }
            }

            Spacer()

            // Action Buttons
            if transfer.status == .PENDING && transfer.toUserId == viewModel.currentUserId {
                actionButtons
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.appBackground.ignoresSafeArea()) // Apply background
        .navigationTitle("Transfer #\(transfer.id)")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // Helper for detail rows
    @ViewBuilder
    private func detailRow(label: String, value: String) -> some View {
        HStack {
            Text(label + ":")
                .font(AppFonts.body)
                .foregroundColor(AppColors.secondaryText)
                .frame(width: 100, alignment: .leading)
            Text(value)
                .font(AppFonts.body)
                .foregroundColor(AppColors.primaryText)
            Spacer()
        }
    }

    @ViewBuilder
    private var actionButtons: some View {
        VStack(spacing: 15) {
            if viewModel.actionState == .loading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: AppColors.accent))
                    .padding(.bottom, 5)
            } else {
                HStack(spacing: 20) {
                    Button("Reject") {
                        viewModel.rejectTransfer(transferId: transfer.id)
                    }
                    .buttonStyle(.primary)
                    .tint(AppColors.destructive) // Destructive tint
                    .disabled(viewModel.actionState == .loading)
                    .frame(maxWidth: .infinity)

                    Button("Approve") {
                        viewModel.approveTransfer(transferId: transfer.id)
                    }
                    .buttonStyle(.primary)
                    // Accent tint is default for primary, no need to set explicitly
                    // .tint(AppColors.accent) // Approve uses default accent tint
                    .disabled(viewModel.actionState == .loading)
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.bottom) 
    }
}

// New Overlay View for Action Status
struct ActionStatusOverlay: View {
    let state: TransfersViewModel.ActionState

    var body: some View {
        VStack {
             Spacer() 
             Group {
                switch state {
                case .idle, .loading:
                    EmptyView()
                case .success(let message):
                    HStack(spacing: 8) {
                        Image(systemName: state.iconName)
                            .foregroundColor(state.iconColor) // Use themed color
                        Text(message)
                            .font(AppFonts.caption) // Use themed font
                            .foregroundColor(AppColors.primaryText)
                    }
                    .padding()
                    .background(AppColors.secondaryBackground.opacity(0.95)) // Themed Background
                    .cornerRadius(10)
                    .shadow(color: .black.opacity(0.2), radius: 3)
                    .transition(.opacity.combined(with: .scale(scale: 0.8)))
                case .error(let message):
                    HStack(spacing: 8) {
                        Image(systemName: state.iconName)
                            .foregroundColor(state.iconColor) // Use themed color
                        Text(message)
                            .font(AppFonts.caption) // Use themed font
                            .foregroundColor(AppColors.primaryText)
                            .lineLimit(2)
                    }
                    .padding()
                    .background(AppColors.secondaryBackground.opacity(0.95)) // Themed Background
                    .cornerRadius(10)
                    .shadow(color: .black.opacity(0.2), radius: 3)
                    .transition(.opacity.combined(with: .scale(scale: 0.8)))
                }
             }
             .padding(.bottom, 30) 
         }
         .animation(.spring(), value: state)
    }
}

// Helper extension for ActionState properties
extension TransfersViewModel.ActionState {
    var message: String {
        switch self {
            case .idle, .loading: return ""
            case .success(let msg): return msg
            case .error(let msg): return msg
        }
    }
    
    var iconName: String {
        switch self {
            case .success: return "checkmark.circle.fill"
            case .error: return "exclamationmark.triangle.fill"
            default: return ""
        }
    }
    
    var iconColor: Color {
        switch self {
            case .success: return AppColors.accent // Themed success color
            case .error: return AppColors.destructive
            default: return .clear
        }
    }
}

struct TransfersView_Previews: PreviewProvider {
    static var previews: some View {
        // Adjust previews if needed, potentially mocking AuthViewModel or currentUserId
        TransfersView()
            .preferredColorScheme(.dark) // Preview in dark mode
    }
} 