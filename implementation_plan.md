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

## Phase 1: Backend Migration & Ledger Integration ✅ **MOSTLY COMPLETE**

### Go Backend Implementation

- **Set Up Go Project Structure** ✅ **COMPLETE**
  - Created directory structure (cmd, internal, pkg, etc.). ✅
  - Initial Go module setup (assuming `go mod init`). ✅
- **Implement Core API Functionality** ✅ **MOSTLY COMPLETE**
  - Set up main application entry point (`server/cmd/server/main.go`). ✅
  - Implemented configuration loading (Viper). ✅
  - Integrated GORM DB connection, Ledger Service, and Repository initialization in `main.go`. ✅
  - Set up basic Gin router in `main.go` / `internal/api/routes.go`. ✅
  - Implemented authentication middleware (Session-based). ✅
  - Implemented user registration/login handlers using repository & bcrypt. ✅
  - Implemented initial protected API endpoint (GET /api/users/me). ✅
  - Implemented core Property API endpoints (CRUD) using Repository and LedgerService. ✅
  - Implemented core Transfer API endpoints (request, approve/reject) using Repository and LedgerService. ✅
  - Implemented Reference DB query endpoints (list types, list models, get model by NSN). ✅
  - **LATER:** Port remaining Node.js routes to Go/Gin.
  - **LATER:** Replicate all current API endpoints.
  - **LATER:** Add/Modify endpoints for:
    - Serial Number lookup and transfer initiation.
    - Reference Database querying (beyond basic NSN lookup).

- **Database Integration** ✅ **COMPLETE**
  - Defined PostgreSQL Schema (Reference DB, Property Table updates) in `server/scripts/postgres_schema_updates.sql`. ✅
  - Updated Domain Models (`server/internal/domain/models.go`) to match schema. ✅
  - Set up GORM for PostgreSQL (`server/internal/platform/database/postgres.go`). ✅
  - Implemented basic Repository layer (`server/internal/repository/`). ✅
  - Applied schema updates to PostgreSQL database. ✅

### Azure SQL Database Ledger Integration

- **Set Up Azure SQL Database Ledger in Azure** ✅ **COMPLETE**
  - Created Azure SQL Server (`handreceipt-ledger-server`). ✅
  - Created Azure SQL Database (`handreceipt-ledger-db`) with Ledger enabled. ✅
  - Configured firewall rules for Azure services and development IP. ✅
  - Stored connection string securely in `.env` (added to `.gitignore`). ✅
- **Implement Ledger Service** ✅ **MOSTLY COMPLETE**
  - Defined `LedgerService` interface (`server/internal/ledger/ledger_service.go`). ✅
  - Implemented `AzureSqlLedgerService` (`server/internal/ledger/azure_sql_ledger_service.go`). ✅
    - Connection logic implemented. ✅
    - Basic event logging functions implemented (matching interface). ✅
    - Database-wide verification function implemented. ✅
    - Refined `GetItemHistory` implementation in `AzureSqlLedgerService`. ✅
  - Defined Azure SQL Ledger Schema in `server/scripts/azure_ledger_schema.sql`. ✅
  - Applied ledger schema to Azure SQL DB. ✅
  - **LATER:** Design and implement correction workflow (`LogCorrectionEvent`).
- **Define Data Boundaries** ✅ **COMPLETE**
  - Formally documented which data resides where (Postgres vs. Azure SQL Ledger) in `DATA_BOUNDARIES.md`. ✅

## Phase 2: Native Mobile Applications

### iOS Application (Swift)

- **Set Up iOS Project**
  - Create Xcode project with SwiftUI/UIKit
  - Configure project structure and dependencies
  - Set up API client for Go backend

- **Implement Core Functionality**
  - Authentication and session management
  - Inventory management screens
  - Transfer workflows (including initiation via SN)
  - Status updates and notifications
  - Reference Database browsing and searching interface.

- **ML Kit / Vision Framework Integration**
  - Integrate Google ML Kit (or Apple Vision for iOS-specific) for:
    - Barcode/QR scanning.
    - On-Device OCR for Serial Number Capture.
  - Implement camera permissions and handling.
  - Create scanning UI with visual feedback.
  - Develop UI for displaying OCR results with confidence scores (if available) and easy user correction.
  - Implement Manual Serial Number Entry UI as a fallback/alternative.
  - **Crucial:** Add confirmation step after SN entry/correction, showing item details from Reference DB lookup.

- **Offline Support**
  - Implement local storage using Core Data.
  - Cache Reference Database text and images locally.
  - Create sync queue for offline actions (including transfers initiated offline).
  - Design conflict resolution strategies.
  - Build robust synchronization with backend.

### Android Application (Kotlin)

- **Set Up Android Project**
  - Create Android Studio project with Jetpack Compose
  - Configure project structure and dependencies
  - Set up API client for Go backend

- **Implement Core Functionality**
  - Authentication and session management
  - Inventory management screens
  - Transfer workflows (including initiation via SN)
  - Status updates and notifications
  - Reference Database browsing and searching interface.

- **ML Kit Integration**
  - Integrate Google ML Kit for:
    - Barcode/QR scanning.
    - On-Device OCR for Serial Number Capture.
  - Implement camera permissions and handling.
  - Create scanning UI with visual feedback.
  - Develop UI for displaying OCR results with confidence scores (if available) and easy user correction.
  - Implement Manual Serial Number Entry UI as a fallback/alternative.
  - **Crucial:** Add confirmation step after SN entry/correction, showing item details from Reference DB lookup.

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

## Next Actions (Revised)

1.  **Immediate (Current Focus - Days/Weeks):**
    *   Port remaining essential Node.js routes to Go/Gin.
    *   Begin mobile app UI scaffolding (Reference DB browsing, Manual SN Entry).
    *   Design and implement ledger correction workflow (`LogCorrectionEvent`).

2.  **Short-term (Next Weeks/Months):**
    *   Begin core development of native mobile applications (Phase 2), integrating Reference DB display and SN capture (Manual + On-Device OCR).
    *   Conduct initial OCR testing.

3.  **Medium-term (Months):**
    *   Complete porting of all API functionality from Node.js.
    *   Implement advanced mobile features (offline support, sync).

4.  **Long-term (3-6+ Months):**
    *   Implement advanced features (Phase 3), enhance mobile apps (cloud OCR fallback etc.), set up robust testing and CI/CD, refine Reference DB data.
