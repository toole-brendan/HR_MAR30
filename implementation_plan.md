# HandReceipt Implementation Plan

This document outlines the complete implementation plan for evolving HandReceipt into a verifiable supply chain management system with immutable ledger technology and native mobile applications.

## Phase 0: Stabilize & Prepare Current Application

### Recent Completed Tasks

- ✅ **Secure Backend Authentication**
  - Implemented password hashing using bcrypt
  - Configured express-session and passport with LocalStrategy
  - Protected API endpoints with isAuthenticated middleware
  - Removed insecure password comparison in login route

### User Action Required: Client Code Cleanup

- **Consolidate Context Directories**
  - Move files from `client/src/context` to `client/src/contexts`:
    - `client/src/context/AppContext.tsx` → `client/src/contexts/AppContext.tsx`
    - `client/src/context/AuthContext.tsx` → `client/src/contexts/AuthContext.tsx`
  - Update all import paths referencing these files
  - Delete the empty `client/src/context` directory

### Immediate Next Steps

- **Refine Session Storage**
  - ✅ Replace `memorystore` with `connect-pg-simple` in `server/index.ts`
  - ✅ Configure session table in PostgreSQL database (Neon DB)
  - ✅ Update session configuration to use database pool

- **Update Frontend Authentication**
  - ✅ Modify `client/src/contexts/AuthContext.tsx` to use new auth endpoints
  - ✅ Update Login component (`client/src/pages/Login.tsx`)
  - ✅ Implement session verification on app load
  - ✅ Add logout functionality

## Phase 1: Backend Migration & Ledger Integration

### Go Backend Implementation

- **Set Up Go Project Structure**
  - Create directory structure:
    ```
    server/
    ├── cmd/
    │   └── server/           # Main entry point
    ├── internal/
    │   ├── api/              # HTTP handlers, middleware
    │   ├── domain/           # Business logic & models
    │   ├── platform/         # Database, logging, auth
    │   ├── ledger/           # QLDB interaction service
    │   └── cv_service/       # Computer Vision service
    ├── pkg/                  # Public library code
    ├── configs/              # Configuration files
    └── scripts/              # Helper scripts
    ```
  - Configure Go modules, dependencies

- **Implement Core API Functionality**
  - Port existing Node.js routes to Go/Gin
  - Implement authentication using JWT or sessions
  - Replicate all current API endpoints

- **Database Integration**
  - Set up GORM for PostgreSQL
  - Migrate database schema
  - Implement repository layer for data access

### Azure SQL Database Ledger Integration

- **Set Up Azure SQL Database Ledger in Azure** ✅ **COMPLETE**
  - Created Azure SQL Server (`handreceipt-ledger-server`). ✅
  - Created Azure SQL Database (`handreceipt-ledger-db`) with Ledger enabled. ✅
  - Configured firewall rules for Azure services and development IP. ✅
  - Stored connection string securely in `.env` (added to `.gitignore`). ✅
  - **NEXT:** Ensure application reads connection string from environment (using Viper/os.Getenv).
  - **NEXT:** Create ledger table schemas in the database (see `AZURE_LEDGER_SETUP.md`).
- **Implement Ledger Service** ⏳ **STARTED (Scaffolded)**
  - Defined `LedgerService` interface (`server/internal/ledger/ledger_service.go`). ✅
  - Scaffolded `AzureSqlLedgerService` implementation (`server/internal/ledger/azure_sql_ledger_service.go`). ✅
  - Added `go-mssqldb` driver dependency and import. ✅
  - Removed incorrect AWS QLDB implementation. ✅
  - **NEXT:** Implement connection logic within `NewAzureSqlLedgerService` using configured credentials.
  - **NEXT:** Implement functions to write events to the ledger tables using T-SQL.
  - **NEXT:** Implement verification and history query capabilities using ledger-specific T-SQL functions.
  - **NEXT:** Design and implement correction workflow.
- **Define Data Boundaries** ❓ **PENDING**

## Phase 2: Native Mobile Applications

### iOS Application (Swift)

- **Set Up iOS Project**
  - Create Xcode project with SwiftUI/UIKit
  - Configure project structure and dependencies
  - Set up API client for Go backend

- **Implement Core Functionality**
  - Authentication and session management
  - Inventory management screens
  - Transfer workflows
  - Status updates and notifications

- **ML Kit Integration**
  - Integrate Google ML Kit for barcode/QR scanning
  - Implement camera permissions and handling
  - Create scanning UI with visual feedback
  - Add manual correction capabilities

- **Offline Support**
  - Implement local storage using Core Data
  - Create sync queue for offline actions
  - Design conflict resolution strategies
  - Build robust synchronization with backend

### Android Application (Kotlin)

- **Set Up Android Project**
  - Create Android Studio project with Jetpack Compose
  - Configure project structure and dependencies
  - Set up API client for Go backend

- **Implement Core Functionality**
  - Authentication and session management
  - Inventory management screens
  - Transfer workflows
  - Status updates and notifications

- **ML Kit Integration**
  - Integrate Google ML Kit for barcode/QR scanning
  - Implement camera permissions and handling
  - Create scanning UI with visual feedback
  - Add manual correction capabilities

- **Offline Support**
  - Implement local storage using Room
  - Create sync queue for offline actions
  - Design conflict resolution strategies
  - Build robust synchronization with backend

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
  - Add OCR capabilities for reading serial numbers
  - Implement damage detection (if applicable)
  - Create seamless cloud fallback for complex analysis

- **Enterprise Features**
  - Implement push notifications
  - Add biometric authentication
  - Create role-specific interfaces

### Testing and Deployment

- **Comprehensive Testing**
  - Unit tests for all components
  - Integration tests for API endpoints
  - E2E tests for critical workflows
  - Mobile application testing

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

## Next Actions

1.  **Immediate (Days):** Implement Go backend code to read Azure connection string; Create ledger table schemas in Azure SQL DB; Begin implementing `AzureSqlLedgerService` methods (event logging).
2.  **Short-term (Weeks):** Complete implementation of `AzureSqlLedgerService` (history retrieval, verification, corrections). Define clear data boundaries between PostgreSQL and Azure SQL Ledger.
3.  **Medium-term (Months):** Begin development of native mobile applications (Phase 2).
4.  **Long-term (3-6+ Months):** Implement advanced features (Phase 3), enhance mobile apps, set up robust testing and CI/CD.
