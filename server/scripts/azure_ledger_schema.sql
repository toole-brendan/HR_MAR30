-- Create a schema to hold the ledger tables if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'HandReceipt')
BEGIN
    EXEC('CREATE SCHEMA HandReceipt');
END
GO

-- 1. Equipment Creation/Registration/Decommissioning Events
CREATE TABLE HandReceipt.EquipmentEvents (
    EventID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemID INT NOT NULL,                 -- Reference to the Equipment ID in your primary DB
    PerformingUserID INT NOT NULL,       -- Reference to the User ID performing the action
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    EventType NVARCHAR(50) NOT NULL CHECK (EventType IN ('Created', 'Registered', 'Decommissioned')), -- Type of event
    Notes NVARCHAR(MAX) NULL             -- Optional notes about the event
)
WITH (SYSTEM_VERSIONING = ON, LEDGER = ON);

-- 2. Sensitive Item Verification Events
CREATE TABLE HandReceipt.VerificationEvents (
    EventID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemID INT NOT NULL,                 -- Reference to the sensitive Equipment ID
    VerifyingUserID INT NOT NULL,        -- Reference to the User ID performing the verification
    VerificationTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    VerificationStatus NVARCHAR(100) NOT NULL CHECK (VerificationStatus IN ('Verified Present', 'Missing', 'Requires Attention', 'Status Unchanged')), -- Result of the check
    Notes NVARCHAR(MAX) NULL             -- Optional notes (e.g., discrepancy details)
)
WITH (SYSTEM_VERSIONING = ON, LEDGER = ON);

-- 3. Transfer Events (Captures the workflow)
CREATE TABLE HandReceipt.TransferEvents (
    EventID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransferRequestID UNIQUEIDENTIFIER NOT NULL, -- Groups events for a single transfer request
    ItemID INT NOT NULL,                 -- Reference to the Equipment ID being transferred
    FromUserID INT NOT NULL,             -- Reference to the User ID transferring FROM
    ToUserID INT NOT NULL,               -- Reference to the User ID transferring TO
    InitiatingUserID INT NOT NULL,       -- User who started the request/transfer process
    ApprovingUserID INT NULL,            -- User who approved/rejected (if applicable)
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    EventType NVARCHAR(50) NOT NULL CHECK (EventType IN ('Requested', 'Approved', 'Rejected', 'Completed', 'Cancelled')), -- Stage in the transfer process
    Notes NVARCHAR(MAX) NULL             -- Optional notes relevant to this specific event stage
)
WITH (SYSTEM_VERSIONING = ON, LEDGER = ON);

-- 4. Maintenance Events
CREATE TABLE HandReceipt.MaintenanceEvents (
    EventID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    MaintenanceRecordID UNIQUEIDENTIFIER NOT NULL, -- Groups events for a single maintenance task
    ItemID INT NOT NULL,                 -- Reference to the Equipment ID undergoing maintenance
    InitiatingUserID INT NOT NULL,       -- User who scheduled/reported the need
    PerformingUserID INT NULL,           -- User who performed the maintenance (if applicable)
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    EventType NVARCHAR(50) NOT NULL CHECK (EventType IN ('Scheduled', 'Started', 'Completed', 'Cancelled', 'Reported Defect')), -- Stage of maintenance
    MaintenanceType NVARCHAR(100) NULL,  -- e.g., 'Preventive', 'Corrective', 'Calibration'
    Description NVARCHAR(MAX) NULL       -- Description of the maintenance event/task
)
WITH (SYSTEM_VERSIONING = ON, LEDGER = ON);

-- 5. Equipment Status Change Events
CREATE TABLE HandReceipt.StatusChangeEvents (
    EventID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemID INT NOT NULL,                 -- Reference to the Equipment ID
    ReportingUserID INT NOT NULL,        -- Reference to the User ID reporting the change
    ChangeTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PreviousStatus NVARCHAR(100) NULL,   -- Optional: Previous status before the change
    NewStatus NVARCHAR(100) NOT NULL CHECK (NewStatus IN ('Operational', 'Non-Operational', 'Damaged', 'Lost', 'Found', 'In Repair')), -- The new status
    Reason NVARCHAR(MAX) NULL            -- Optional reason for the status change
)
WITH (SYSTEM_VERSIONING = ON, LEDGER = ON);
