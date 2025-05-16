# HandReceipt Implementation Plan

This document outlines the complete implementation plan for evolving HandReceipt into a verifiable supply chain management system with immutable ledger technology, native mobile applications, enhanced identification methods, and a comprehensive reference database.

## Phase 0: Stabilize & Prepare Current Application ✅ **COMPLETE**

### Completed Tasks

- ✅ **Secure Backend Authentication** (Node.js)
  - Implemented password hashing using bcrypt
  - Configured express-session and passport with LocalStrategy
  - Protected API endpoints with isAuthenticated middleware
  - Removed insecure password comparison in login route
- ✅ **Refine Session Storage** (Node.js)
  - Replaced `memorystore` with `connect-pg-simple` in `server/index.ts`
  - Configured session table in PostgreSQL database (Neon DB)
  - Updated session configuration to use database pool
- ✅ **Update Frontend Authentication** (React)
  - Modified `client/src/contexts/AuthContext.tsx` to use new auth endpoints
  - Updated Login component (`client/src/pages/Login.tsx`)
  - Implemented session verification on app load
  - Added logout functionality
- ✅ **Client Code Cleanup** (React)
  - Consolidated context directories (`client/src/context` → `client/src/contexts`)
  - Updated all import paths
  - Deleted the empty `client/src/context` directory

## Phase 1: Backend Migration & Ledger Integration ✅ **COMPLETE**

### Go Backend Implementation

- **Set Up Go Project Structure** ✅ **COMPLETE**
  - ✅ Created directory structure (cmd, internal, pkg, etc.).
  - ✅ Initial Go module setup (assuming `go mod init`).
- **Implement Core API Functionality** ✅ **COMPLETE**
  - ✅ Set up main application entry point (`server/cmd/server/main.go`).
  - ✅ Implemented configuration loading (Viper).
  - ✅ Integrated GORM DB connection, Ledger Service, and Repository initialization in `main.go`.
  - ✅ Set up basic Gin router in `main.go` / `internal/api/routes.go`.
  - ✅ Implemented authentication middleware (Session-based).
  - ✅ Implemented user registration/login handlers using repository & bcrypt.
  - ✅ Implemented initial protected API endpoint (GET /api/users/me).
  - ✅ Implemented core Property API endpoints (CRUD) using Repository and LedgerService.
  - ✅ Implemented core Transfer API endpoints (request, approve/reject) using Repository and LedgerService.
  - ✅ Implemented Reference DB query endpoints (list types, list models, get model by NSN).
  - ✅ Ported remaining Node.js routes (User management: GET /users, GET /users/:id) to Go/Gin.
  - ✅ Replicated essential API endpoints (Auth, Inventory, Transfers, Activities, Users).
  - ✅ Added Endpoint: `GET /api/inventory/serial/:serialNumber` for property lookup by serial number.
  - **LATER:**
    - Add/Modify endpoints for Reference Database querying (beyond basic NSN lookup).
    - Add/Modify endpoints for initiating transfers via Serial Number.

- **Database Integration** ✅ **COMPLETE**
  - ✅ Defined PostgreSQL Schema (Reference DB, Property Table updates) in `server/scripts/postgres_schema_updates.sql`.
  - ✅ Updated Domain Models (`server/internal/domain/models.go`) to match schema.
  - ✅ Set up GORM for PostgreSQL (`server/internal/platform/database/postgres.go`).
  - ✅ Implemented basic Repository layer (`server/internal/repository/`).
  - ✅ Applied schema updates to PostgreSQL database.
  - ✅ Applied ledger schema to Azure SQL DB.
  - ✅ Designed and implemented correction workflow (`LogCorrectionEvent`) using separate `CorrectionEvents` table.
  - ✅ Implemented query methods for correction events (`GetAll`, `GetByID`, `GetByOriginalID`).
  - ✅ Implemented database-wide ledger verification endpoint (`GET /api/verification/database`).

### Azure SQL Database Ledger Integration

- **Set Up Azure SQL Database Ledger in Azure** ✅ **COMPLETE**
  - ✅ Created Azure SQL Server (`handreceipt-ledger-server`).
  - ✅ Created Azure SQL Database (`handreceipt-ledger-db`) with Ledger enabled.
  - ✅ Configured firewall rules for Azure services and development IP.
  - ✅ Stored connection string securely in `.env` (added to `.gitignore`).
- **Implement Ledger Service** ✅ **COMPLETE**
  - ✅ Defined `LedgerService` interface (`server/internal/ledger/ledger_service.go`).
  - ✅ Implemented `AzureSqlLedgerService` (`server/internal/ledger/azure_sql_ledger_service.go`).
    - ✅ Connection logic implemented.
    - ✅ Basic event logging functions implemented (matching interface).
    - ✅ Database-wide verification function implemented.
    - ✅ Refined `GetItemHistory` implementation in `AzureSqlLedgerService`.
    - ✅ Implemented Correction Event logging and querying methods.
  - ✅ Defined Azure SQL Ledger Schema in `server/scripts/azure_ledger_schema.sql`.
- **Define Data Boundaries** ✅ **COMPLETE**
  - ✅ Formally documented which data resides where (Postgres vs. Azure SQL Ledger) in `DATA_BOUNDARIES.md`.

## Phase 2: Native Mobile Applications (In Progress)

### iOS Application (Swift)

- **Set Up iOS Project** (Initial Steps)
  - ✅ Created basic directory structure (`mobile/ios/HandReceipt/Views`).
  - ✅ Created `Models`, `ViewModels`, `Services` directories.
  - ✅ Created basic UI Scaffolding for:
    - `ReferenceDatabaseBrowserView.swift`
    - `ManualSNEntryView.swift`

- **Implement Core Functionality**
  - ✅ Defined `ReferenceItem.swift`, `Property.swift`, `AuthModels.swift`.
  - ✅ Implemented `APIService.swift` (URLSession) including `login` function and basic cookie handling setup.
  - ✅ Implemented `ReferenceDBViewModel.swift`.
  - ✅ Implemented `ManualSNViewModel.swift`.
  - ✅ Implemented `LoginViewModel.swift`.
  - ✅ Updated `ReferenceDatabaseBrowserView.swift` (uses NavLink).
  - ✅ Updated `ManualSNEntryView.swift`.
  - ✅ Implemented basic `LoginView.swift`.
  - ✅ Implemented basic Navigation (`ContentView.swift` managing auth state, `MainAppView` using `NavigationView` and `.sheet`).
  - ✅ Implement Session Checking (at app start).
  - ✅ Implement Logout functionality.
  - ✅ Refine error handling and user feedback across all screens.
  - ✅ Implement core Transfer workflow UI & Logic (List, Detail, Approve/Reject).
  - ✅ Implement core Scan workflow UI & Logic (Camera, API Call, Confirmation).
  - ✅ Implement Transfer Initiation from Scan/Property Detail (User Selection).
  - **LATER:**
    - Add search/filtering to Reference DB Browser.
    - Implement Property Detail screen *full* functionality (e.g., fetch assigned user name).
    - Status updates and notifications

- **ML Kit / Vision Framework Integration**
  - ✅ Integrate Apple Vision for iOS-specific tasks.
  - ✅ Barcode/QR scanning integrated.
  - ✅ On-Device OCR for Serial Number Capture integrated.
  - ✅ Camera permissions and handling implemented.
  - ✅ Scanning UI with visual feedback implemented.
  - ✅ Manual Serial Number Entry UI implemented.
  - ✅ Confirmation step after SN entry implemented.
  - **LATER:** Refine OCR/Scanning based on testing (confidence scores, challenging conditions).

- **Offline Support**
  - Implement local storage using Core Data.
  - Cache Reference Database text and images locally.
  - Create sync queue for offline actions (including transfers initiated offline).
  - Design conflict resolution strategies.
  - Build robust synchronization with backend.

### Android Application (Kotlin)

- **Set Up Android Project** (Initial Steps)
  - ✅ Created basic directory structure (`mobile/android/app/src/main/java/com/example/handreceipt/ui/screens`).
  - ✅ Created `data/model`, `data/network`, `viewmodels` directories.
  - ✅ Created basic UI Scaffolding for:
    - `ReferenceDatabaseBrowserScreen.kt`
    - `ManualSNEntryScreen.kt`

- **Implement Core Functionality**
  - ✅ Defined `ReferenceItem.kt`, `Property.kt`, `AuthModels.kt`.
  - ✅ Implemented `ApiService.kt` (Retrofit) including `login` function.
  - ✅ Implemented `ReferenceDbViewModel.kt` (uses shared OkHttpClient/Retrofit setup).
  - ✅ Implemented `ManualSNViewModel.kt` (uses shared OkHttpClient/Retrofit setup).
  - ✅ Implemented `LoginViewModel.kt`.
  - ✅ Updated `ReferenceDatabaseBrowserScreen.kt` (accepts Nav Lambdas, added FAB).
  - ✅ Updated `ManualSNEntryScreen.kt`.
  - ✅ Implemented basic `LoginScreen.kt`.
  - ✅ Implemented basic Navigation (`AppNavigation.kt` using NavHost).
  - ✅ Updated `MainActivity.kt` to use `AppNavigation`.
  ✅ Initialize Android Gradle Project (build.gradle, settings.gradle, etc.).
  ✅ Configure base dependencies (Retrofit, Gson, Coil, Lifecycle, Compose) in `app/build.gradle`.
  ✅ Implement Session Checking at app start using `AuthViewModel`.
  ✅ Implement Logout functionality using `AuthViewModel` and `MainAppScaffold`.
  ✅ Implement Ref Item Detail screen data fetching using `ReferenceItemDetailViewModel`.
  ✅ Configure Gson for Date/UUID types using TypeAdapter in `NetworkModule`.
  ✅ Add Coil placeholder/error drawables (`ic_placeholder.xml`, `ic_broken_image.xml`).
  ✅ Refactor network client setup using DI (**Hilt**).
  ✅ Refine error handling and user feedback across core screens.
  ✅ Implement core Transfer workflow UI & Logic (List, Detail, Approve/Reject).
  ✅ Implement core Scan workflow UI & Logic (CameraX, MLKit, API Call, Confirmation).
  ✅ Implement Transfer Initiation from Scan/Property Detail (User Selection).
  **LATER:**
    - Add search/filtering to Reference DB Browser.
    - Implement Property Detail screen *full* functionality (e.g., fetch assigned user name).
    - Status updates and notifications

- **ML Kit Integration**
  - ✅ Integrate Google ML Kit.
  - ✅ Barcode/QR scanning integrated.
  - ✅ On-Device OCR for Serial Number Capture integrated.
  - ✅ Camera permissions and handling implemented.
  - ✅ Scanning UI with visual feedback implemented.
  - ✅ Manual Serial Number Entry UI implemented.
  - ✅ Confirmation step after SN entry implemented.
  - **LATER:** Refine OCR/Scanning based on testing (confidence scores, challenging conditions).

- **Offline Support**
  - Implement local storage using Room.
  - Cache Reference Database text and images locally.
  - Create sync queue for offline actions (including transfers initiated offline).
  - Design conflict resolution strategies.
  - Build robust synchronization with backend.

## Phase 3: Advanced Features & Refinements

### Web Application Enhancements

- **Ledger Verification UI**
  - Add verification status indicators (based on Azure SQL Ledger verification).
  - Create ledger history explorer/verification interface.
  - Implement verification status pages.
  - ✅ Backend endpoint for database verification implemented (`GET /api/verification/database`).
- **Correction Log UI** ✅ **COMPLETE**
  - ✅ Added `CorrectionLogPage.tsx`.
  - ✅ Integrated `authedFetch` into `AuthContext.tsx`.
  - ✅ Added routing and sidebar navigation link.

- **Reporting and Analytics**
  - Enhance dashboard with real-time Azure SQL Ledger data.
  - Create audit trail visualization using ledger history.
  - Implement export capabilities.

### Mobile Application Enhancements

- **Advanced CV Features**
  - Enhance OCR capabilities (e.g., cloud fallback using Azure AI Vision/Google Cloud Vision if on-device struggles and network is available).
  - Investigate specialized commercial OCR SDKs if needed for challenging SNs (e.g., DPM) and budget allows.
  - Implement damage detection (if applicable).
  - Consider limited Computer Vision Identification for specific items, linking suggestions to Reference Database.

- **Enterprise Features**
  - Implement push notifications
  - Add biometric authentication
  - Create role-specific interfaces

### Testing and Deployment

- **Comprehensive Testing**
  - Unit tests for all components
  - Integration tests for API endpoints
  - E2E tests for critical workflows (including SN-based transfers)
  - Mobile application testing:
    - OCR Accuracy: Test across diverse equipment, SN conditions (wear, dirt, lighting), phone models.
    - Manual Entry: Test usability, confirmation step effectiveness, handling of typos.
    - Reference Database: Test search/browse, image loading (online/offline), data accuracy.
    - End-to-End SN Workflow: Test successful transfers, denials, offline/online transitions using both OCR and manual SN entry.
    - Edge Cases: Test invalid/unknown SNs, items without SNs, permissions issues.
    - Barcode/QR scanning functionality.

- **CI/CD Setup**
  - Configure GitHub Actions or similar
  - Automate build and test processes
  - Set up containerization (Docker)
  - Configure Kubernetes for orchestration

- **Deployment**
  - Configure cloud hosting
  - Set up database migrations
  - Prepare mobile app store submissions
  - Create deployment documentation

## Next Actions (Revised - Post Core Mobile Scan/Transfer)

1.  **Short-term (Completed):**
    *   ✅ Implement Scan functionality (Camera integration, OCR/Barcode processing) (iOS & Android).
        *   **iOS:**
            *   ✅ Integrate `AVFoundation` / `Vision`.
            *   ✅ Implement permissions.
            *   ✅ Integrate barcode/QR scanning.
            *   ✅ Integrate OCR.
            *   ✅ Develop UI (`CameraView`, `ScanView`).
            *   ✅ Implement logic (`ScanViewModel`).
            *   ✅ Add API call (`fetchPropertyBySerial`).
            *   ✅ Implement confirmation UI.
            *   ✅ Implement confirmation action (triggers user selection).
        *   **Android:**
            *   ✅ Integrate CameraX.
            *   ✅ Implement permissions.
            *   ✅ Integrate ML Kit Barcode Scanning.
            *   ✅ Integrate ML Kit Text Recognition.
            *   ✅ Develop UI (`CameraView.kt`, `ScanScreen.kt`).
            *   ✅ Implement logic (`ScanViewModel`).
            *   ✅ Add API call (`getPropertyBySerial`).
            *   ✅ Implement confirmation UI.
            *   ✅ Implement confirmation action (triggers user selection sheet).
    *   ✅ Implement Transfer workflow functionality (API calls, UI updates) (iOS & Android).
        *   **Backend (Go):**
            *   ✅ Review/confirm existing Transfer API endpoints.
            *   ✅ Ensure endpoint exists to fetch single transfer by ID (`GET /api/transfers/{id}`).
        *   **Data Models (Mobile):**
            *   ✅ Define/Consolidate `Transfer`, `TransferRequest`, `UserSummary` models.
        *   **iOS:**
            *   ✅ Update `APIService.swift` with transfer functions.
            *   ✅ Implement `TransfersViewModel.swift` (List fetch, Approve/Reject).
            *   ✅ Implement `TransferDetailViewModel.swift` (Fetch detail).
            *   ✅ Implement `TransfersView.swift` (List display, Filters).
            *   ✅ Implement `TransferDetailView.swift` (Detail display, Action buttons).
            *   ✅ Implement `UserSelectionViewModel/View` (Fetch users, Selection UI).
            *   ✅ Implement Transfer Initiation flow (`PropertyDetailView`/`ScanView` -> `UserSelectionView` -> `ViewModel.initiateTransfer`).
        *   **Android:**
            *   ✅ Update `ApiService.kt` with transfer endpoints.
            *   ✅ Implement `TransfersViewModel.kt` (List fetch, Approve/Reject).
            *   ✅ Implement `TransferDetailViewModel.kt` (Fetch detail).
            *   ✅ Implement `TransfersScreen.kt` (List display, Filters).
            *   ✅ Implement `TransferDetailScreen.kt` (Detail display, Action buttons).
            *   ✅ Implement `UserSelectionViewModel/Screen` (Fetch users, Selection UI).
            *   ✅ Implement Transfer Initiation flow (`PropertyDetailScreen`/`ScanScreen` -> `UserSelectionScreen` -> `ViewModel.initiateTransfer`).
    *   **LATER:** Conduct initial OCR/Scanning testing (iOS & Android).

2.  **Current Focus (Immediate Next Steps):**
    *   Start Building Tests:
        *   ✅ Implement initial unit tests for Go backend (Repository layer).
    *   Scaffold Web Ledger Verification UI:
        *   ✅ Create `LedgerVerificationPage.tsx` component.
        *   ✅ Add routing and sidebar navigation for the new page.
        *   ✅ Add placeholders for `LedgerStatusIndicator` and `LedgerHistoryExplorer`.

3.  **Near-term Focus (Following Current):**
    *   Implement mobile Search/Filtering (e.g., in Reference DB Browser).
    *   Implement Property Detail screen *full* functionality (e.g., fetch assigned user name).
    *   Refine Transfer workflow (e.g., handle edge cases, improve UI feedback, fetch user names).
    *   Refine OCR/Scanning based on testing.

4.  **Long-term (Months):**
    *   Implement advanced mobile features (offline support, sync).
    *   Implement advanced features (Phase 3 - Web UI, Reporting, Advanced CV, Enterprise), enhance mobile apps (cloud OCR fallback etc.), set up robust testing and CI/CD, refine Reference DB data.
