# Azure SQL Database Ledger Setup Guide

This document outlines the steps to set up Azure SQL Database with Ledger features enabled for HandReceipt's immutable audit trail.

## Prerequisites

- An Azure account with an active subscription
- Admin access to create resources and configure permissions
- Azure CLI (optional, for command-line setup)

## 1. Create an Azure SQL Server

### Portal Method

1. Log in to the [Azure Portal](https://portal.azure.com)
2. Search for "SQL servers" in the search bar
3. Click "Create" or "+ Add" to start the creation process
4. Fill in the following details:
   - **Subscription**: Select your Azure subscription
   - **Resource group**: Create a new one or use an existing group
   - **Server name**: Enter a globally unique name (e.g., `handreceipt-ledger-server`)
   - **Location**: Choose a region close to your primary users 
   - **Authentication method**: Choose "Use SQL authentication"
   - **Server admin login**: Create an admin username
   - **Password**: Create a secure password (store this safely)
5. Click "Review + create" and then "Create" after validation passes

### CLI Method (Alternative)

```bash
# Login to Azure
az login

# Create a resource group if needed
az group create --name HandReceiptGroup --location eastus

# Create SQL Server
az sql server create \
  --name handreceipt-ledger-server \
  --resource-group HandReceiptGroup \
  --location eastus \
  --admin-user youradminname \
  --admin-password YourSecurePassword123!
```

## 2. Configure Firewall Rules

By default, Azure SQL Servers block all connections. You need to add firewall rules.

### Portal Method

1. Navigate to your newly created SQL server
2. Under "Security", select "Networking"
3. Under "Firewall rules":
   - Set "Allow Azure services and resources to access this server" to "Yes"
   - Add your client IP address:
     - Name: "Development Machine"
     - Start IP: Your IP address
     - End IP: Your IP address
4. Click "Save"

### CLI Method (Alternative)

```bash
# Add firewall rule for Azure services
az sql server firewall-rule create \
  --name AllowAzureServices \
  --server handreceipt-ledger-server \
  --resource-group HandReceiptGroup \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Add firewall rule for your development machine
az sql server firewall-rule create \
  --name DevMachine \
  --server handreceipt-ledger-server \
  --resource-group HandReceiptGroup \
  --start-ip-address <your-ip-address> \
  --end-ip-address <your-ip-address>
```

## 3. Create a Database with Ledger Enabled

### Portal Method

1. Navigate to your SQL server in the Azure Portal
2. Click on "Databases" in the left menu
3. Click "+ Add" to create a new database
4. Fill in the details:
   - **Database name**: `handreceipt-ledger-db`
   - **Compute + storage**: Choose an appropriate tier (e.g., Basic or Standard for development)
5. Click on the "Additional settings" tab
6. Under **Data Ledger**:
   - Set "Enable ledger" to "Yes"
   - Select "Append-only ledger" for full immutability, or "Updatable ledger" if you need to support corrections
7. Click "Review + create" and then "Create"

### CLI Method (Alternative)

```bash
# Create database with ledger enabled
az sql db create \
  --name handreceipt-ledger-db \
  --server handreceipt-ledger-server \
  --resource-group HandReceiptGroup \
  --edition Standard \
  --ledger-on true
```

## 4. Get Connection Information

### Portal Method

1. Navigate to your database in the Azure Portal
2. Click on "Connection strings" in the left menu
3. Under "ADO.NET", copy the connection string
4. Replace `{your_password}` with your actual server admin password

### CLI Method (Alternative)

```bash
# Get connection strings
az sql db show-connection-string \
  --name handreceipt-ledger-db \
  --server handreceipt-ledger-server \
  --client ado.net
```

Example connection string format:
```
Server=tcp:handreceipt-ledger-server.database.windows.net,1433;Initial Catalog=handreceipt-ledger-db;Persist Security Info=False;User ID=youradminname;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

## 5. Create Ledger Tables

After connecting to your database, create ledger tables with T-SQL. You can use:

- Azure Data Studio
- SQL Server Management Studio
- Or the Query Editor in the Azure Portal

### Example Ledger Table Schema

```sql
-- Example for item creation ledger table
CREATE TABLE ItemCreationLedger
(
    LedgerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemID INT NOT NULL,
    SerialNumber NVARCHAR(100) NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Category NVARCHAR(100) NULL,
    EventUserID INT NOT NULL,
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    
    -- Additional ledger-specific fields generated automatically
    -- ledger_start_transaction_id, ledger_end_transaction_id, etc.
) WITH 
(
    SYSTEM_VERSIONING = ON,
    LEDGER = ON
);

-- Example for transfer event ledger table
CREATE TABLE TransferLedger
(
    LedgerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransferID INT NOT NULL,
    ItemID INT NOT NULL,
    SerialNumber NVARCHAR(100) NOT NULL,
    FromUserID INT NOT NULL,
    ToUserID INT NOT NULL, 
    Status NVARCHAR(50) NOT NULL,
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
) WITH 
(
    SYSTEM_VERSIONING = ON,
    LEDGER = ON
);

-- Example for status change ledger table
CREATE TABLE StatusChangeLedger
(
    LedgerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemID INT NOT NULL,
    SerialNumber NVARCHAR(100) NOT NULL,
    OldStatus NVARCHAR(50) NOT NULL,
    NewStatus NVARCHAR(50) NOT NULL,
    EventUserID INT NOT NULL,
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
) WITH 
(
    SYSTEM_VERSIONING = ON,
    LEDGER = ON
);

-- Example for verification event ledger table
CREATE TABLE VerificationLedger
(
    LedgerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ItemID INT NOT NULL,
    SerialNumber NVARCHAR(100) NOT NULL,
    VerificationType NVARCHAR(50) NOT NULL,
    VerifiedByUserID INT NOT NULL,
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
) WITH 
(
    SYSTEM_VERSIONING = ON,
    LEDGER = ON
);

-- Example for correction ledger table
CREATE TABLE CorrectionLedger
(
    LedgerID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OriginalEventID UNIQUEIDENTIFIER NOT NULL,
    EventType NVARCHAR(50) NOT NULL,
    Reason NVARCHAR(255) NOT NULL,
    CorrectedByUserID INT NOT NULL,
    EventTimestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
) WITH 
(
    SYSTEM_VERSIONING = ON,
    LEDGER = ON
);
```

## 6. Secure Connection String for Application

The database connection string contains sensitive information and should never be stored in code or versioned files.

### Option 1: Environment Variables (Development)

1. Store connection string in an environment variable:
   ```bash
   # Linux/macOS
   export AZURE_SQL_LEDGER_CONNECTION_STRING="Server=tcp:your-server.database.windows.net,1433;..."
   
   # Windows (PowerShell)
   $env:AZURE_SQL_LEDGER_CONNECTION_STRING="Server=tcp:your-server.database.windows.net,1433;..."
   ```

2. Update your application to read from environment variables:
   ```go
   connectionString := os.Getenv("AZURE_SQL_LEDGER_CONNECTION_STRING")
   if connectionString == "" {
       log.Fatal("Azure SQL Ledger connection string not set")
   }
   ledgerService, err := ledger.NewAzureSqlLedgerService(connectionString)
   ```

### Option 2: Azure Key Vault (Production - Recommended)

1. Create an Azure Key Vault
2. Store the connection string as a secret
3. Configure your application with an identity that has access to the Key Vault
4. Retrieve the connection string at runtime

This approach provides better security for production environments.

## 7. Verify Ledger Setup

After creating tables, you can verify the ledger is working properly:

```sql
-- Check if tables have ledger feature enabled
SELECT 
    name AS table_name,
    is_ledger_table,
    ledger_view_schema_name,
    ledger_view_name
FROM sys.tables
WHERE is_ledger_table = 1;

-- Verify the database ledger
EXEC sys.sp_verify_database_ledger;
```

## Next Steps

1. Configure the connection string in your application
2. Implement the `AzureSqlLedgerService` to interact with the ledger tables
3. Test ledger operations (create, read, verify)
4. Implement scheduled verification and digest storage for stronger security

## Resources

- [Azure SQL Database Ledger Documentation](https://docs.microsoft.com/en-us/azure/azure-sql/database/ledger-overview)
- [T-SQL Reference for Ledger Tables](https://docs.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql?view=sql-server-ver15#ledger-tables)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/) 