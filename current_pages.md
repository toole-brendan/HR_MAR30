# Current Pages in the HandReceipt Application

## Login Page
- User authentication interface with username/password login form
- Demo credentials provided (username: john.doe, password: password)
- DOD system disclaimer

## Dashboard
- Main landing page after authentication
- Summary statistics for:
  - Total inventory
  - Pending transfers
  - Sensitive items verified
  - Items needing maintenance
  - **Equipment Readiness Overview** (summary widget)
  - **Calibration Status Summary** (e.g., items due/overdue)
  - **Consumables Status** (e.g., low stock items)
- Quick action buttons for common tasks
- Pending transfers section
- My inventory overview
- Equipment status and readiness metrics
- Recent activity log
- **Access to Notification History** (if integrated here)
- **Critical Shortage Alerts**
- **Offline Status Indicator** (persistent banner when offline)
- **Sync Status Indicator** (e.g., actions pending sync, possibly via notifications)

## Inventory
- Equipment tracking and management (including **Consumables** via tab/filter)
- Search and filter functionality for inventory items (including calibration filters)
- List of equipment with details (serial numbers, status, etc.)
- Actions for each item:
  - Transfer request initiation
  - QR code generation
  - Detailed view
- Modal view for individual item details including service history:
  - **Component (BII/COEI) List:** View, add, edit, remove associated components.
  - **Calibration Information:** View calibration status, due dates, history.
- **Multi-select Functionality:** Select multiple items for bulk actions.
- **Bulk Action Menu:** Contextual menu for actions like bulk status updates, QR code generation, etc.
- **Consumables Management (Integrated View):**
  - Track inventory levels, usage, and minimum quantities for consumables.
  - UI for consumption and restock simulation.
  - Low stock indicators.

## Transfers
- Manages equipment transfers between personnel
- Transfer request creation and tracking
- Status monitoring for pending transfers
- Detail views for individual transfers
- **Detailed Functionality**:
  - Three main views: Incoming transfers, Outgoing transfers, and Transfer history
  - Filter transfers by status (pending, approved, rejected)
  - Search functionality by item name, serial number, sender, or receiver
  - Transfer approval/rejection workflow with confirmation
  - QR code scanning to initiate new transfers
  - Sort transfers by date, name, sender, or receiver
  - Transfer details modal with complete information
  - **Bulk Actions:** Process multiple selected transfers (e.g., approve/reject).
  - **Mass Transfer Modal:** Initiate Change of Command/Responsibility transfers involving multiple items.
  - Export transfer documentation
  - Integrated QR code generation for transferred items

## PropertyBook
- Official record of unit property and equipment accountability
- Formal inventory documentation
- Historical record keeping
- **Detailed Functionality**:
  - Two main views: "Assigned to Me" and "Signed Down to Others"
  - Equipment categorization (protective, weapons, communication, optics, medical, gear, etc.)
  - Visual category indicators with color-coding and icons
  - Search functionality by name, serial number, or assignee
  - Status tracking with badges (active, pending, transferred)
  - Transfer request initiation from property book
  - QR code generation for individual items
  - Item details modal with complete information:
    - **Component (BII/COEI) List:** View associated components.
    - **Calibration Information:** View calibration status and history.
  - Export capabilities for inventory reports
  - Bulk QR code scanning functionality
  - **Multi-select Functionality:** Select multiple items for bulk actions.
  - **Bulk Action Menu:** Contextual menu for actions like bulk status updates, assignment changes, etc.
  - Verification requests for signed-out equipment
  - Recall functionality for equipment signed to others
  - Automatic categorization of equipment by type
  - Assignment date tracking
  - Item condition monitoring
  - Comprehensive equipment history
  - Last updated timestamps

## SensitiveItems
- Special tracking for high-value or security-critical equipment
- Additional verification requirements, **including checks for required components (BII/COEI)**.
- Status tracking and notifications

## Maintenance
- Tracks equipment maintenance schedules and status
- Upcoming maintenance requirements
- Service history tracking
- Maintenance request management
- **Calibration Management Tab/Section:**
  - View TMDE items requiring calibration.
  - Track calibration status (current, due-soon, overdue) and due dates.
  - View calibration history.
  - Simulate calibration certificate management.
  - Calendar view for due dates.
  - Mark items as 'in-calibration'.
  - Calibration forecasting (e.g., items due in 30/60/90 days).

## Reports
- Generates reports on:
  - Inventory status
  - Transfer history
  - Equipment condition
  - Compliance metrics
  - **Component Status:** Report on presence/absence of BII/COEI.
  - **Readiness Dashboard:** Visualize overall equipment readiness, drill-down capability.
  - **Shortage Analysis:** Compare on-hand inventory against mock authorizations (MTOE/TDA) to identify shortages.
  - **Mock Authorization Data Management:** UI to manage local mock authorization data for shortage analysis.
  - **Calibration Status Reports:** Detailed reports on TMDE calibration status and forecasts.
  - **Consumables Reports:** Consumption rates, reorder recommendations.
- Client-side export simulation (e.g., PDF, Excel) for various reports.
- Commander's review/certification simulation.

## QRManagement
- Creates and manages QR codes for equipment tracking
- Generation of new codes
- Assignment to equipment
- Scanning history
- **Detailed Functionality**:
  - QR code status tracking (active, damaged, missing, replaced)
  - Search and filter functionality for QR codes
  - Generate new QR codes for equipment items
  - Report damaged or missing QR codes with reason tracking
  - Print individual or batch QR codes
  - QR code maintenance workflow:
    1. Report damaged QR code
    2. Print replacement QR code
    3. Mark QR code as replaced
  - QR code detail view showing associated equipment information
  - Last printed date tracking
  - Status badges for visual indication of QR code states
  - **Multi-select Functionality:** Select multiple QR codes.
  - **Bulk Action Menu:** Contextual menu for batch operations (e.g., replacing multiple damaged codes).
  - QR code history tracking

## Scan
- Interface for scanning QR codes on equipment (or simulating scans)
- Quick access to equipment details
- Action initiation based on scan results
- **Component/Calibration Verification:** Use scanning (simulation) to verify components or calibration status.
- **Consumables Tracking:** Use scanning (simulation) for issuing or consuming items.
- **Works Offline:** Scanning functionality remains available in offline mode, interacting with local data.

## AuditLog
- Records and displays system actions for accountability
- Timestamped activity records
- User action tracking
- Compliance verification

## Settings
- System configuration options
- User preferences
- **Notification Settings:** Configure notification types and preferences (client-side).
- System parameters

## Profile
- User profile management
- Personal information
- Role and access level
- Assigned equipment overview
- **Access to Notification History/Center** (if integrated here)
- **Notification Preferences** (alternative location to Settings)

## Not Found
- 404 page for non-existent routes 

## Sidebar Navigation
- Logo and branding (HandReceipt)
- User profile section displaying name and role
- Main navigation items:
  - Dashboard
  - Property Book
  - Sensitive Items 
  - Transfers
  - Maintenance
  - QR Management
  - Reports
- **Notification Indicator:** Icon/badge showing unread notification count, links to notification panel/center.
- Footer actions:
  - Scan QR Code (quick access)
  - Settings
  - Profile
  - Theme toggle (light/dark mode)
- Collapsible design for better space management

## Mock User Details
- **Name**: CPT Michael Rodriguez
- **Rank**: Captain (O-3)
- **Position**: Company Commander, Bravo Company
- **Unit**: 2-87 Infantry Battalion, 2nd Brigade Combat Team, 10th Mountain Division
- **Years of Service**: 6
- **Command Time**: 3 months
- **Responsibility**: Primary Hand Receipt Holder for company-level property
- **Value Managed**: $4.2M in equipment
- **Equipment Summary**:
  - Vehicles: 72
  - Weapons: 143
  - Communications: 95
  - Optical Systems: 63
  - Sensitive Items: 210
- **Upcoming Events**:
  - National Training Center rotation (in 4 months)
  - Post-deployment equipment reset (in progress)
- **Demo Login**: username: michael.rodriguez, password: password 

## General Features
- **Offline Capability:** Core functions (viewing data, scanning, queuing actions like transfers/updates) work without a network connection using local storage (IndexedDB) and service workers. Visual indicators show online/offline status and pending sync actions.

CURRENT TREE STRUCTURE OF APP:

brendantoole@Mac frontend_defense % tree
[1.0K]  .
├── [2.7K]  attached_assets
├── [ 160]  client
│   ├── [ 128]  public
│   │   └── [ 128]  fonts
│   └── [ 384]  src
│       ├── [6.1K]  App.tsx
│       ├── [ 384]  components
│       │   ├── [ 256]  common
│       │   │   ├── [2.0K]  ActivityItem.tsx
│       │   │   ├── [2.3K]  InventoryItem.tsx
│       │   │   ├── [2.5K]  NotificationItem.tsx
│       │   │   ├── [7.8K]  QRCodeGenerator.tsx
│       │   │   ├── [1.2K]  StatusBadge.tsx
│       │   │   └── [ 879]  UserProfile.tsx
│       │   ├── [  96]  consumables
│       │   │   └── [ 39K]  ConsumablesManager.tsx
│       │   ├── [ 288]  dashboard
│       │   │   ├── [1.3K]  ActivityLogItem.tsx
│       │   │   ├── [2.6K]  MyInventory.tsx
│       │   │   ├── [3.0K]  PendingTransfers.tsx
│       │   │   ├── [4.2K]  QuickActions.tsx
│       │   │   ├── [2.2K]  RecentActivity.tsx
│       │   │   ├── [2.0K]  StatCard.tsx
│       │   │   └── [2.5K]  TransferItem.tsx
│       │   ├── [  96]  inventory
│       │   │   └── [ 11K]  ComponentList.tsx
│       │   ├── [ 256]  layout
│       │   │   ├── [4.2K]  AppShell.tsx
│       │   │   ├── [1.1K]  MobileMenu.tsx
│       │   │   ├── [2.6K]  MobileNav.tsx
│       │   │   ├── [ 17K]  Sidebar.tsx
│       │   │   ├── [1.9K]  StandardPageLayout.tsx
│       │   │   └── [3.0K]  TopNavBar.tsx
│       │   ├── [  96]  maintenance
│       │   │   └── [ 23K]  CalibrationManager.tsx
│       │   ├── [ 160]  modals
│       │   │   ├── [7.8K]  NotificationPanel.tsx
│       │   │   ├── [7.1K]  QRScannerModal.tsx
│       │   │   └── [6.4K]  TransferRequestModal.tsx
│       │   ├── [ 192]  reports
│       │   │   ├── [ 18K]  InventoryAnalytics.tsx
│       │   │   ├── [4.6K]  MockAuthorizationManager.tsx
│       │   │   ├── [8.4K]  ReadinessDashboard.tsx
│       │   │   └── [7.1K]  ShortageAnalysis.tsx
│       │   ├── [ 128]  shared
│       │   │   ├── [2.2K]  BulkActionMenu.tsx
│       │   │   └── [3.5K]  QRScannerModal.tsx
│       │   └── [1.7K]  ui
│       │       ├── [1.9K]  accordion.tsx
│       │       ├── [4.3K]  alert-dialog.tsx
│       │       ├── [1.5K]  alert.tsx
│       │       ├── [ 140]  aspect-ratio.tsx
│       │       ├── [1.4K]  avatar.tsx
│       │       ├── [1.1K]  badge.tsx
│       │       ├── [2.6K]  breadcrumb.tsx
│       │       ├── [1.9K]  button.tsx
│       │       ├── [2.5K]  calendar.tsx
│       │       ├── [1.9K]  card.tsx
│       │       ├── [6.1K]  carousel.tsx
│       │       ├── [ 10K]  chart.tsx
│       │       ├── [1.0K]  checkbox.tsx
│       │       ├── [ 315]  collapsible.tsx
│       │       ├── [4.8K]  command.tsx
│       │       ├── [7.1K]  context-menu.tsx
│       │       ├── [3.7K]  dialog.tsx
│       │       ├── [2.9K]  drawer.tsx
│       │       ├── [7.2K]  dropdown-menu.tsx
│       │       ├── [4.0K]  form.tsx
│       │       ├── [1.2K]  hover-card.tsx
│       │       ├── [2.1K]  input-otp.tsx
│       │       ├── [ 845]  input.tsx
│       │       ├── [ 710]  label.tsx
│       │       ├── [7.8K]  menubar.tsx
│       │       ├── [4.9K]  navigation-menu.tsx
│       │       ├── [1.4K]  page-container.tsx
│       │       ├── [1.3K]  page-header.tsx
│       │       ├── [1.3K]  page-wrapper.tsx
│       │       ├── [2.7K]  pagination.tsx
│       │       ├── [1.2K]  popover.tsx
│       │       ├── [ 777]  progress.tsx
│       │       ├── [1.4K]  radio-group.tsx
│       │       ├── [1.7K]  resizable.tsx
│       │       ├── [2.0K]  responsive-container.tsx
│       │       ├── [1.6K]  scroll-area.tsx
│       │       ├── [5.5K]  select.tsx
│       │       ├── [ 756]  separator.tsx
│       │       ├── [4.2K]  sheet.tsx
│       │       ├── [ 23K]  sidebar.tsx
│       │       ├── [ 261]  skeleton.tsx
│       │       ├── [1.1K]  slider.tsx
│       │       ├── [1.1K]  switch.tsx
│       │       ├── [2.7K]  table.tsx
│       │       ├── [1.8K]  tabs.tsx
│       │       ├── [ 772]  textarea.tsx
│       │       ├── [4.7K]  toast.tsx
│       │       ├── [ 772]  toaster.tsx
│       │       ├── [1.7K]  toggle-group.tsx
│       │       ├── [1.4K]  toggle.tsx
│       │       └── [1.1K]  tooltip.tsx
│       ├── [ 128]  context
│       │   ├── [2.3K]  AppContext.tsx
│       │   └── [2.4K]  AuthContext.tsx
│       ├── [  96]  contexts
│       │   └── [3.6K]  NotificationContext.tsx
│       ├── [ 160]  hooks
│       │   ├── [ 864]  use-mobile.tsx
│       │   ├── [3.5K]  use-page-layout.tsx
│       │   └── [3.8K]  use-toast.ts
│       ├── [ 384]  lib
│       │   ├── [5.5K]  consumablesData.ts
│       │   ├── [8.4K]  idb.ts
│       │   ├── [9.4K]  maintenanceData.ts
│       │   ├── [9.3K]  mockData.ts
│       │   ├── [ 976]  navigation.ts
│       │   ├── [1.0K]  qrScanner.ts
│       │   ├── [2.1K]  queryClient.ts
│       │   ├── [1.4K]  seedDB.ts
│       │   ├── [ 12K]  sensitiveItemsData.ts
│       │   └── [ 166]  utils.ts
│       ├── [2.9K]  main.tsx
│       ├── [ 512]  pages
│       │   ├── [4.8K]  AuditLog.tsx
│       │   ├── [ 22K]  Dashboard.tsx
│       │   ├── [ 17K]  Inventory.tsx
│       │   ├── [4.5K]  Login.tsx
│       │   ├── [ 60K]  Maintenance.tsx
│       │   ├── [ 16K]  Profile.tsx
│       │   ├── [ 27K]  PropertyBook.tsx
│       │   ├── [ 42K]  QRManagement.tsx
│       │   ├── [ 48K]  Reports.tsx
│       │   ├── [3.0K]  Scan.tsx
│       │   ├── [ 38K]  SensitiveItems.tsx
│       │   ├── [ 59K]  Settings.tsx
│       │   ├── [ 43K]  Transfers.tsx
│       │   └── [ 711]  not-found.tsx
│       └── [ 128]  types
│           ├── [3.4K]  index.ts
│           └── [1.6K]  reporting.ts
├── [ 325]  drizzle.config.ts
├── [ 192]  server
│   ├── [3.5K]  index.ts
│   ├── [5.5K]  routes.ts
│   ├── [6.2K]  storage.ts
│   └── [4.2K]  vite.ts
├── [  96]  shared
│   └── [2.8K]  schema.ts
├── [6.0K]  tailwind.config.ts
└── [1.1K]  vite.config.ts

25 directories, 124 files
brendantoole@Mac frontend_defense % 