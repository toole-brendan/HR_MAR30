# HandReceipt Feature Implementation Plan - Frontend Focus

This document outlines the technical implementation details *from a frontend perspective* for high-priority feature enhancements to the HandReceipt application, focusing on demo capabilities.

## 1. Component Tracking (BII/COEI) - Moved Up

### Overview
Enable tracking of Basic Issue Items (BII) and Components of End Items (COEI) that are associated with primary equipment items within the frontend application state.

### Technical Implementation (Frontend Focus)

#### Frontend Data Model Extensions
- Extend the inventory item data model in `shared/types/inventory.ts`:
  ```typescript
  // shared/types/inventory.ts
  interface Component {
    id: string; // Client-generated or from mock data
    name: string;
    nsn?: string;
    serialNumber?: string;
    quantity: number;
    required: boolean;
    status: 'present' | 'missing' | 'damaged';
    notes?: string;
  }

  interface InventoryItem {
    // Existing fields
    components?: Component[];
    isComponent?: boolean; // Flag if the item itself is a component
    parentItemId?: string; // Link to parent if it's a component
  }
  ```

#### UI Implementation
- Create an expandable component list in item detail views:
  ```tsx
  // client/src/components/inventory/ComponentList.tsx
  const ComponentList = ({ 
    itemId, 
    components, 
    onAddComponent, 
    onUpdateComponent, 
    onRemoveComponent 
  }) => {
    // Implementation for displaying, adding, editing, and removing components via state updates
  };
  ```
- Add component management UI within the inventory/property book views:
  - UI for adding/removing components to/from an item.
  - UI for setting component quantities and statuses.
  - *Optional:* UI for importing components from local mock data (e.g., JSON/CSV).

#### Frontend Verification Workflows
- Update the sensitive item verification process UI to include component checks based on local data.
- Add checklist functionality UI for verifying all components during inspections.
- Implement UI warnings (e.g., modals, toasts) when a primary item is marked for transfer without all required components present in the local state.
- **Add QR Code / NFC Scanning Simulation for Verification:**
  - **Simple Simulation:** Add a "Simulate Scan" button next to verifiable items (e.g., sensitive items, components in a checklist). Clicking this button triggers the verification action (e.g., marks item as 'present' or 'verified') in the local state.
  - **(Optional) Advanced Simulation:** Implement a file input allowing upload of an image containing a QR code. Use a client-side library (e.g., `jsqr`, `zxing-js/browser`) to decode the QR code. Match the decoded data (e.g., item ID, serial number) against local mock data and trigger the corresponding verification action.

#### Frontend Reporting Display
- Extend frontend report views/components to display component status based on local data.
- Add UI elements for potential component shortage reporting (calculated client-side against mock data).
- Create component-specific views within the frontend inventory reporting section.

#### Integration into Existing Structure
- **Primary UI Location:** The `ComponentList.tsx` and related management UI will be integrated into the **modal/detailed view** of individual items, accessible from both the `Inventory` and `PropertyBook` pages.
- **Verification Workflow Integration:** Component checks will be added to the existing verification processes on the `SensitiveItems` page. Updates related to scanning components can be triggered via the `Scan` page functionality.
- **Reporting Integration:** Component status data and potential shortage reports will be displayed as new sections or tables within the existing `Reports` page.
- **New Pages Required:** 0

## 2. Bulk Operations - Moved Up

### Overview
Enable efficient handling of multiple items simultaneously for common operations within the frontend UI, updating local state.

### Technical Implementation (Frontend Focus)

#### Selection Mechanism
- Implement multi-select functionality in list/table views using local state:
  ```tsx
  // client/src/components/shared/SelectableTable.tsx
  interface SelectableTableProps<T> {
    items: T[];
    selectedIds: Set<string>; // Manage selected IDs in parent component state
    onSelectionChange: (selectedIds: Set<string>) => void;
    // Other props like columns, rendering functions
  }
  ```
- Add UI controls for batch selection (select all displayed, select by category filter, clear selection).

#### Bulk Actions UI
- Create a contextual action menu component that appears when items are selected:
  ```tsx
  // client/src/components/shared/BulkActionMenu.tsx
  const BulkActionMenu = ({ 
    selectedItemCount, 
    availableActions, // e.g., ['transfer', 'updateStatus', 'printQR']
    onActionTriggered // Callback to handle the action in the parent component
  }) => {
    // Implementation using a dropdown or button group
  };
  ```
- Implement client-side handlers/state updates for common bulk operations:
  - Triggering a bulk transfer modal/workflow.
  - Opening a modal to update status/location for selected items.
  - Generating QR codes locally (if using a library like `qrcode.react`).
  - Updating assignment status in local state.

#### Mass Transfer Feature UI
- Create a dedicated page/modal for change of command/responsibility transfers:
  ```tsx
  // client/src/pages/MassTransfer.tsx
  // Or client/src/components/modals/MassTransferModal.tsx
  const MassTransfer = () => {
    const [sourceUser, setSourceUser] = useState<User | null>(null); // From local mock user data
    const [destinationUser, setDestinationUser] = useState<User | null>(null); // From local mock user data
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    // UI: User selectors, item selector table (SelectableTable), confirmation steps
    // Handle transfer logic purely by updating local state for demo
  };
  ```
- Add client-side filters to inventory views based on currently assigned user (using local state).
- *Optional:* Implement transfer templates using predefined local JSON data.

#### Frontend Verification Process
- Implement batch verification UI for sensitive items (e.g., select multiple -> click "Verify Selected").
- Create confirmation modal dialogs to prevent accidental bulk actions before updating local state.
- *Note:* Audit logging is typically backend; for demo, can log to console or temporary local store.
- *(Scanning simulation details added under Component Tracking Verification Workflows, applicable here too)*

#### UI Implementation Refinements
- Add UI affordances for bulk operations in all relevant screens (Inventory, Transfers, Property Book).
- Create client-side progress indicators (e.g., spinners, progress bars) for simulated long-running bulk actions (using `setTimeout` for demo).
- Implement success/error summaries using toasts or modals after bulk actions complete in the UI.

#### Integration into Existing Structure
- **Primary UI Location:** Multi-select capabilities (`SelectableTable.tsx`) and the contextual action menu (`BulkActionMenu.tsx`) will be added to the main list/table views on the `Inventory`, `Transfers`, `PropertyBook`, and `QRManagement` pages.
- **Mass Transfer UI:** The dedicated mass transfer UI (`MassTransfer.tsx` or `MassTransferModal.tsx`) will be implemented as a **modal**, launched via a button added to the `Transfers` page (e.g., "Initiate Change of Responsibility Transfer").
- **New Pages Required:** 0

## 3. Enhanced Notifications & Alerts - Moved Up

### Overview
Create a comprehensive notification system within the frontend to proactively alert users about important events, deadlines, and required actions based on client-side logic and mock data.

### Technical Implementation (Frontend Focus)

#### Frontend Notification System
- Create a central notification context/store (e.g., Zustand, Redux, React Context):
  ```typescript
  // client/src/stores/notificationStore.ts 
  // Or client/src/contexts/NotificationContext.tsx
  interface Notification {
    id: string; // Use uuid library or similar client-side
    type: 'info' | 'warning' | 'critical' | 'success';
    title: string;
    message: string;
    relatedEntityType?: string; // e.g., 'InventoryItem', 'TransferRequest'
    relatedEntityId?: string; // ID for linking
    timestamp: number;
    read: boolean;
    action?: {
      label: string;
      path: string; // React Router path
    };
  }

  // State: notifications: Notification[]
  // Actions: addNotification, markAsRead, clearAll, etc.
  ```
- Implement persistent storage for notifications using `localStorage` or `IndexedDB` so they persist across sessions.
- Simulate real-time delivery using timers or mock events if needed for demo.

#### Client-Side Notification Triggers
- Implement client-side logic to generate notifications based on:
  - Checking dates in local data (e.g., sensitive item verification due, maintenance/calibration deadlines).
  - Simulating events (e.g., mock transfer request arrival).
  - Detecting discrepancies in mock inventory data.
  - System announcements stored in local config/mock data.
  - *Note:* Triggers based on *other users'* actions would be simulated.

#### User Preferences UI
- Add a notification settings component within the user profile page:
  ```tsx
  // client/src/components/profile/NotificationPreferences.tsx
  const NotificationPreferences = () => {
    // UI for configuring notification preferences (stored in localStorage)
    // Checkboxes/toggles for notification types, delivery methods (in-app only for demo)
  };
  ```
- Allow client-side filtering of displayed notifications based on these preferences.

#### UI Components
- Enhance the existing notification panel/modal component:
  ```tsx
  // client/src/components/shared/NotificationPanel.tsx
  const NotificationPanel = () => {
    // Fetch notifications from store/context
    // UI enhancements: Grouping, filtering, mark all as read button
  };
  ```
- Add notification badge component (e.g., on a bell icon) showing unread count from the store.
- Create a dedicated notification center page (route) for viewing historical notifications from local storage.

#### Browser Push Notifications (Optional Demo)
- Implement browser push notifications using the Push API for critical alerts (requires user permission).
- Add permission request workflow UI.
- Trigger pushes from client-side logic for demo purposes.

#### Integration into Existing Structure
- **Global UI Elements:** A notification indicator (icon/badge with count) will be added to a persistent area, likely the `Sidebar Navigation` or a global header. Clicking this opens the `NotificationPanel.tsx` modal.
- **Notification History:** A link within the panel can navigate to a comprehensive history view. This view will be integrated as a **new section or tab within the existing `Dashboard` or `Profile` page**.
- **Preferences:** Notification preferences (`NotificationPreferences.tsx`) will be added as a section within the existing `Settings` or `Profile` page.
- **New Pages Required:** 0

## 4. Offline Capability (Frontend Focus)

### Overview
Enable critical app functionality to work without a simulated internet connection using client-side storage and service workers for caching.

### Technical Implementation (Frontend Focus)

#### Client-Side Data Storage
- Implement IndexedDB wrapper/hook for client-side data persistence:
  - Define schemas mimicking necessary data models (inventory, transfers, etc.).
  - Store essential data fetched initially or generated locally.
- *Note:* Conflict resolution UI might be complex for a demo; focus on queuing actions.

#### Service Workers
- Register a service worker (`client/public/service-worker.js` or similar via build tool):
  - Use workbox or manual implementation to cache application shell (HTML, CSS, JS, images).
  - Intercept network requests: Serve from cache first when offline (`CacheFirst` or `StaleWhileRevalidate` strategy). For API calls, attempt network; if fails and offline, potentially use cached data or queue action.
  - Implement background sync simulation: Queue actions (create/update/delete) intended for the server in IndexedDB when offline.

#### Sync Queue Mechanism (Client-Side)
- Define the structure for the sync queue in IndexedDB:
  ```typescript
  // client/src/lib/syncQueue.ts
  interface SyncAction {
    id: string; // uuid
    type: 'apiCall'; // Or more specific like 'createItem', 'updateTransfer'
    payload: {
      method: 'POST' | 'PUT' | 'DELETE';
      url: string; // The intended API endpoint
      data: any; // The request body
    };
    timestamp: number;
    status: 'pending' | 'syncing' | 'failed';
  }
  ```
- Create functions to add actions to this queue.
- *Demo:* Manually trigger a "sync attempt" which logs queued actions to console.

#### Modified Components (Frontend Logic)
- Update all form submissions and action handlers:
  - Check `navigator.onLine` status.
  - If online, proceed with simulated API call.
  - If offline, add the intended action to the sync queue in IndexedDB.
  - Provide immediate user feedback about offline status and action being queued.
- Modify critical workflows (transfer approval, sensitive item verification) to primarily use/update data stored in IndexedDB when offline.

#### User Experience (UX)
- Add visual indicators using UI components:
  ```tsx
  // client/src/components/shared/OfflineIndicator.tsx
  import { useOnlineStatus } from '@hooks/useOnlineStatus'; // Example hook

  const OfflineIndicator = () => {
    const isOnline = useOnlineStatus();
    return isOnline ? null : <div className="offline-banner">Offline Mode</div>;
  };
  ```
  - Persistent banner/indicator for offline status.
  - Visual badges on items/lists modified offline but not yet synced.
  - UI element showing sync queue status (e.g., "3 actions pending sync").
- *Note:* Full conflict resolution UI is likely out of scope for demo.
- **Include Scanning Simulation:** Ensure scanning simulation (as described in Component Tracking verification) can be triggered and functions correctly when the application is in a simulated offline state, interacting with data stored in IndexedDB.

#### Integration into Existing Structure
- **Global UI Indicator:** The `OfflineIndicator.tsx` will be displayed as a persistent banner across the application when offline.
- **Sync Status:** Information about pending sync actions will be surfaced through the `Enhanced Notifications` system or another subtle global indicator.
- **Core Logic:** This feature primarily involves modifying existing components and application-wide infrastructure (service workers, data storage) rather than residing on a specific page.
- **New Pages Required:** 0

## 5. Readiness & Shortage Reporting (Frontend Focus)

### Overview
Implement frontend reporting capabilities to display equipment readiness assessments and identify shortages based on local/mock data.

### Technical Implementation (Frontend Focus)

#### Frontend Data Models
- Define TypeScript interfaces for reporting structures in `shared/types/reporting.ts`:
  ```typescript
  // shared/types/reporting.ts
  // Keep ReadinessCategory, ReadinessReport interfaces as defined previously.
  // Keep AuthorizationData, ShortageReport interfaces as defined previously.
  // These will be populated with mock data or calculated client-side.
  ```

#### UI Implementation
- Create a Readiness Dashboard component:
  ```tsx
  // client/src/components/reports/ReadinessDashboard.tsx
  const ReadinessDashboard = () => {
    const [readinessData, setReadinessData] = useState<ReadinessReport | null>(null);
    // Fetch/calculate readiness based on local/mock InventoryItem data
    // Use charting libraries (e.g., Recharts, Chart.js) for visualization
    // Implementation for displaying readiness metrics with drill-down capability
  };
  ```
- Implement a Shortage Analysis view component:
  ```tsx
  // client/src/components/reports/ShortageAnalysis.tsx
  const ShortageAnalysis = () => {
    const [shortageData, setShortageData] = useState<ShortageReport | null>(null);
    const [authData, setAuthData] = useState<AuthorizationData | null>(null); // Load mock auth data
    // Calculate shortages client-side by comparing mock inventory with mock auth data
    // Implementation for displaying and analyzing shortages
  };
  ```
- Add reusable visualization components:
  - Readiness status charts (using a library).
  - Equipment category breakdown tables/charts.
  - *Optional:* Basic historical trend simulation using multiple mock snapshots.

#### Mock Authorization Data Management
- Create a simple UI page or component for managing *local mock* MTOE/TDA data:
  ```tsx
  // client/src/pages/MockAuthorizationData.tsx
  const MockAuthorizationData = () => {
    // Interface for managing local mock authorization documents (stored in localStorage/IndexedDB):
    // - Load/Save mock data (e.g., from a JSON file or text input)
    // - Simple table view/editor for mock line items
  };
  ```
- Implement client-side data validation for mock data structure.

#### Frontend Reporting Workflows
- Implement client-side report generation logic:
  - Functions to calculate readiness based on current item statuses in local state/IndexedDB.
  - Functions to calculate shortages by comparing local inventory state with loaded mock authorization data.
  - Add UI buttons for on-demand generation/refresh.
  - *Optional:* Use a library like `jsPDF` or `xlsx` for client-side export simulation.
- Simulate commander's review/certification with simple UI elements (e.g., a "Certify" button that updates a status locally).

#### Dashboard Integration
- Add readiness status summary components to the main dashboard, reading from calculated/mock data.
- Create critical shortage alerts based on client-side calculations.
- Implement readiness trend visualizations using mock historical data points.

#### Integration into Existing Structure
- **Primary UI Location:** The `ReadinessDashboard.tsx` and `ShortageAnalysis.tsx` components will be implemented as **new sections or views within the existing `Reports` page**.
- **Mock Data Management:** The UI for managing mock authorization data (`MockAuthorizationData.tsx`) will also be placed within the `Reports` page, likely associated with the Shortage Analysis section.
- **Dashboard Summary:** Summary widgets derived from these reports will be added to the main `Dashboard` page.
- **New Pages Required:** 0

## 6. Calibration Tracking

### Overview
Implement specialized tracking for Test, Measurement, and Diagnostic Equipment (TMDE) calibration requirements within the frontend, using local data.

### Technical Implementation (Frontend Focus)

#### Frontend Data Model Extensions
- Extend inventory items with calibration metadata in `shared/types/inventory.ts`:
  ```typescript
  // shared/types/inventory.ts
  // Keep CalibrationInfo interface as defined previously.

  interface InventoryItem {
    // Existing fields
    requiresCalibration?: boolean;
    calibrationInfo?: CalibrationInfo;
  }
  ```
  - Populate this with mock data for relevant items.

#### UI Implementation
- Create a calibration management component, perhaps as a tab within Maintenance or a dedicated view:
  ```tsx
  // client/src/components/maintenance/CalibrationManager.tsx
  const CalibrationManager = () => {
    // Filter local inventory items where requiresCalibration is true
    // Display items, calibration status, due dates
    // Allow editing calibration dates/info in local state
  };
  ```
- Add UI elements to display calibration history (read from mock `calibrationInfo` or a simulated history array).
- Implement UI for simulated calibration certificate upload (e.g., storing a mock file name or data URL in local state).
- Create a simple calendar view highlighting mock calibration due dates (using a library like `react-calendar` or `date-fns`).

#### Frontend Workflows
- Implement client-side logic for calibration due status:
  - Calculate `calibrationStatus` ('current', 'due-soon', 'overdue') based on `calibrationDueDate` and current date.
  - Trigger local notifications (using the Notification System) based on these calculated statuses.
  - Display mock calibration facility information.
  - Add UI elements to mark items as 'in-calibration' (updating local state).
- Add calibration verification steps to relevant UI checklists (inventory/sensitive item checks).
- **Scanning simulation details added under Component Tracking Verification Workflows, applicable here too**
- Create client-side forecasting display (e.g., list items due in next 30/60/90 days).

#### Dashboard Integration
- Add a calibration status summary widget to the dashboard (reading local data).
- Create calibration-specific filters in inventory list views.
- Add "Calibration Due" category to alerts/notifications UI.

#### Frontend Reporting Display
- Create UI components to display calibration status reports based on local data.
- Implement UI for calibration forecast reports (listing upcoming due dates).
- Add calibration history display to item detail views.

#### Integration into Existing Structure
- **Primary UI Location:** The main `CalibrationManager.tsx` component and related views will be added as a **new tab or distinct section within the existing `Maintenance` page**.
- **Item Detail Integration:** Calibration status and relevant dates/information will also be displayed within the item detail modals accessible from the `Inventory` and `PropertyBook` pages.
- **Notifications:** Alerts for due/overdue calibration will utilize the `Enhanced Notifications` system.
- **Dashboard Summary:** A summary widget can be added to the `Dashboard`.
- **New Pages Required:** 0

## 7. Consumables Management

### Overview
Create a simplified system within the frontend for tracking consumable items using local state and mock data.

### Technical Implementation (Frontend Focus)

#### Frontend Data Model
- Create a consumable item type interface in `shared/types/inventory.ts` (or a new `consumables.ts`):
  ```typescript
  // shared/types/consumables.ts
  interface ConsumableItem {
    id: string; // client-generated uuid
    name: string;
    nsn?: string;
    category: string;
    unit: string; // e.g., 'each', 'box', 'pack'
    currentQuantity: number;
    minimumQuantity: number;
    location?: string;
    expirationDate?: string; // Optional
    notes?: string;
    lastRestockDate?: string; // Optional
    // issuedTo might be complex for demo, perhaps simplify
  }
  ```

#### UI Implementation
- Create a dedicated Consumables page/route:
  ```tsx
  // client/src/pages/Consumables.tsx
  const Consumables = () => {
    const [items, setItems] = useState<ConsumableItem[]>([]); // Load/manage mock consumables
    const [filter, setFilter] = useState({ category: 'all' });
    // Display items in a table, allow adding/editing/deleting mock items
  };
  ```
- Add consumables management UI components:
  - Display inventory levels.
  - UI for tracking usage (decrementing quantity in local state).
  - Visual indicators for low stock (currentQuantity <= minimumQuantity).
  - Simple UI for simulating reorders (e.g., button to reset quantity).

#### Frontend Consumption Workflows
- Implement issue/consumption tracking UI:
  ```tsx
  // client/src/components/consumables/ConsumptionForm.tsx
  const ConsumptionForm = ({ item, onConsume }) => {
    // Form to input quantity used, updates item.currentQuantity in parent state via onConsume callback
  };
  ```
- Create UI for simulating a restock process (e.g., modal to set new quantity and date).
- Add basic batch operations UI (e.g., delete selected consumables).
- **Scanning simulation could potentially be used here for issuing/consuming items**

#### Dashboard Integration
- Add a consumables status widget to the dashboard (e.g., number of low-stock items).
- Create low-stock warnings/indicators based on local data comparison.
- *Optional:* Simple visualization of usage trends using mock historical data.

#### Frontend Reporting Display
- Implement simple UI reports for consumption rates (based on mock usage logs).
- Create UI for reorder recommendations (list items below minimum quantity).

#### Integration into Existing Structure
- **Primary UI Location:** The consumables management UI (`Consumables.tsx` view) will be integrated into the **existing `Inventory` page, likely as a distinct tab or filter mode** to separate consumables from standard equipment, avoiding the need for a new top-level page.
- **Dashboard Summary:** A status widget (e.g., low-stock items count) will be added to the `Dashboard`.
- **Notifications:** Low-stock warnings will utilize the `Enhanced Notifications` system.
- **New Pages Required:** 0 (by integrating into `Inventory`)

## Implementation Timeline and Dependencies (Frontend Demo Focus)

*This timeline prioritizes features for demonstrating core UI/UX improvements and concepts on the frontend, using mock data and client-side logic.*

### Phase 1 (Focus: Core Data & UX - Est. 1-2 Sprints)
1.  **Component Tracking (BII/COEI)** - Foundational data structure and UI for inventory detail. (Includes scanning simulation for verification).
2.  **Bulk Operations** - Major usability improvement for list views.

### Phase 2 (Focus: Dynamics & Field Use Concept - Est. 1-2 Sprints)
3.  **Enhanced Notifications & Alerts** - Makes the app feel more interactive (client-side triggers).
4.  **Offline Capability (Frontend Focus)** - Demonstrates field readiness concept via service workers and IndexedDB for caching and basic action queuing. (Requires scanning simulation to work offline).

### Phase 3 (Focus: Reporting & Special Cases - Est. 2-3 Sprints)
5.  **Readiness & Shortage Reporting (Frontend Focus)** - Adds leadership view using mock/local data; Shortage requires mock auth data setup.
6.  **Calibration Tracking** - Specialized workflow extension. (Can utilize scanning simulation).
7.  **Consumables Management** - Separate module demonstrating tracking of different item types. (Can utilize scanning simulation).

### Key Frontend Dependencies
- **Component Tracking** UI enhances data displayed in **Bulk Operations** and **Reporting**.
- **Enhanced Notifications** provides the UI framework for alerts needed by **Calibration Tracking**, **Offline Capability** (sync status), and potentially **Reporting** (e.g., low readiness).
- **Offline Capability** foundational work (IndexedDB setup) might be useful for storing state for other features like **Notifications** or **Mock Auth Data**. Needs scanning simulation.
- **Readiness & Shortage Reporting** relies on having reasonable mock data for inventory (including components if applicable) and potentially mock authorization data.
