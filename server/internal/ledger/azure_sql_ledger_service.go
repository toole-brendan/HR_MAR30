package ledger

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/microsoft/go-mssqldb" // Azure SQL Database driver
	"github.com/yourusername/handreceipt/internal/domain"
	// Consider using Viper for configuration management if not already set up globally
)

// Ensure AzureSqlLedgerService implements LedgerService interface at compile time
var _ LedgerService = (*AzureSqlLedgerService)(nil)

// AzureSqlLedgerService implements the LedgerService interface for Azure SQL Database Ledger.
type AzureSqlLedgerService struct {
	db *sql.DB // Standard SQL database connection pool
	// Add configuration fields if needed (e.g., table names)
}

// NewAzureSqlLedgerService creates a new Azure SQL Database Ledger service.
// It requires database connection details, likely fetched from configuration.
func NewAzureSqlLedgerService(connectionString string) (*AzureSqlLedgerService, error) {
	// TODO: Make sure the correct Azure SQL driver is imported above
	// Use sql.Open() with the appropriate driver name ("sqlserver" for go-mssqldb)
	db, err := sql.Open("sqlserver", connectionString) // Replace "sqlserver" if using a different driver name
	if err != nil {
		return nil, fmt.Errorf("error opening Azure SQL connection: %w", err)
	}

	// Ping the database to verify the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second) // Add timeout
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		db.Close() // Close the connection if ping fails
		return nil, fmt.Errorf("error pinging Azure SQL database: %w", err)
	}

	log.Println("Successfully connected to Azure SQL Database")

	service := &AzureSqlLedgerService{
		db: db,
	}

	return service, nil
}

// Initialize performs any setup needed for the ledger service.
// For Azure SQL, this might involve ensuring ledger tables exist or are configured.
func (s *AzureSqlLedgerService) Initialize() error {
	// TODO: Optionally, check if required ledger tables exist and create/configure if needed.
	// This might involve executing `CREATE TABLE ... WITH (SYSTEM_VERSIONING = ON, LEDGER = ON)` statements.
	// Be cautious about auto-creating tables in production environments.
	log.Println("AzureSqlLedgerService Initialize: No specific initialization actions implemented yet.")
	return nil
}

// LogItemCreation logs an equipment creation/registration event to the Azure SQL Ledger.
// This implementation assumes the event type is 'Created' based on the function name.
func (s *AzureSqlLedgerService) LogItemCreation(property domain.Property, userID uint) error {
	ctx := context.Background() // Or use a more specific context if available
	log.Printf("AzureSqlLedgerService: Logging Equipment Event - ItemID: %d, UserID: %d, Type: Created", property.ID, userID)

	// EventType is hardcoded to 'Created' for this function
	const eventType = "Created"
	// Notes are not provided by the interface, setting to NULL
	var notes sql.NullString

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO HandReceipt.EquipmentEvents (ItemID, PerformingUserID, EventType, Notes, EventTimestamp)
		 VALUES (@p1, @p2, @p3, @p4, SYSUTCDATETIME())`, // Use SYSUTCDATETIME() for DB-generated timestamp
		property.ID, // Get ItemID from the domain.Property object
		userID,      // UserID passed as argument
		eventType,
		notes, // Pass NULL for notes
	)

	if err != nil {
		log.Printf("Error logging Equipment Event to Azure SQL Ledger: %v", err)
		return fmt.Errorf("failed to log Equipment Event: %w", err)
	}
	log.Printf("Successfully logged Equipment Event - ItemID: %d, Type: %s", property.ID, eventType)
	return nil
}

// LogTransferEvent logs a specific stage of an equipment transfer to the Azure SQL Ledger.
// It uses the transfer.Status as the EventType for the ledger entry.
func (s *AzureSqlLedgerService) LogTransferEvent(transfer domain.Transfer, serialNumber string) error {
	ctx := context.Background()
	eventType := transfer.Status // Map domain.Transfer.Status to EventType
	// Use transfer.ID as the grouping identifier for the request. Convert uint to string.
	transferRequestID := fmt.Sprintf("%d", transfer.ID)

	log.Printf("AzureSqlLedgerService: Logging Transfer Event - RequestID: %s, ItemID: %d, SN: %s, Type: %s", transferRequestID, transfer.PropertyID, serialNumber, eventType)

	// Validate EventType (derived from transfer.Status) against allowed values in the schema
	allowedTypes := map[string]bool{"Requested": true, "Approved": true, "Rejected": true, "Completed": true, "Cancelled": true}
	if !allowedTypes[eventType] {
		return fmt.Errorf("invalid EventType (from transfer.Status) '%s' for TransferEvents", eventType)
	}

	// Assumptions:
	// - InitiatingUserID is the FromUserID for this event log.
	// - ApprovingUserID is not provided by the interface, setting to NULL.
	initiatingUserID := transfer.FromUserID
	var approvingUserID sql.NullInt64 // Set to NULL
	// Handle optional notes from domain.Transfer
	notesDB := sql.NullString{}
	if transfer.Notes != nil {
		notesDB.String = *transfer.Notes
		notesDB.Valid = true
	}

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO HandReceipt.TransferEvents (TransferRequestID, ItemID, FromUserID, ToUserID, InitiatingUserID, ApprovingUserID, EventType, Notes, EventTimestamp)
		 VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, SYSUTCDATETIME())`,
		transferRequestID,
		transfer.PropertyID,
		transfer.FromUserID,
		transfer.ToUserID,
		initiatingUserID, // Assumed initiator
		approvingUserID,  // Assumed NULL approver
		eventType,
		notesDB, // Use sql.NullString for nullable notes
	)

	if err != nil {
		log.Printf("Error logging Transfer Event to Azure SQL Ledger: %v", err)
		return fmt.Errorf("failed to log Transfer Event: %w", err)
	}
	log.Printf("Successfully logged Transfer Event - RequestID: %s, ItemID: %d, Type: %s", transferRequestID, transfer.PropertyID, eventType)
	return nil
}

// LogStatusChange logs a status change event for an item to the Azure SQL Ledger.
func (s *AzureSqlLedgerService) LogStatusChange(itemID uint, serialNumber string, oldStatus string, newStatus string, userID uint) error {
	ctx := context.Background() // Or use a more specific context if available
	// Log using provided parameters, including serialNumber even if not directly inserted
	log.Printf("AzureSqlLedgerService: Logging Status Change - ItemID: %d, SN: %s, UserID: %d, FromStatus: %s, ToStatus: %s", itemID, serialNumber, userID, oldStatus, newStatus)

	// Validate NewStatus against allowed values in the schema
	allowedStatuses := map[string]bool{"Operational": true, "Non-Operational": true, "Damaged": true, "Lost": true, "Found": true, "In Repair": true}
	if !allowedStatuses[newStatus] {
		return fmt.Errorf("invalid NewStatus '%s' for StatusChangeEvents", newStatus)
	}

	// Prepare parameters for DB insertion
	previousStatusDB := sql.NullString{String: oldStatus, Valid: oldStatus != ""}
	// Reason is not provided by the interface, set to NULL
	var reasonDB sql.NullString

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO HandReceipt.StatusChangeEvents (ItemID, ReportingUserID, PreviousStatus, NewStatus, Reason, ChangeTimestamp)
		 VALUES (@p1, @p2, @p3, @p4, @p5, SYSUTCDATETIME())`,
		itemID,
		userID,           // Map userID from interface to ReportingUserID
		previousStatusDB, // Use sql.NullString for nullable PreviousStatus
		newStatus,
		reasonDB, // Pass NULL for Reason
	)

	if err != nil {
		log.Printf("Error logging Status Change event to Azure SQL Ledger: %v", err)
		return fmt.Errorf("failed to log Status Change event: %w", err)
	}
	log.Printf("Successfully logged Status Change - ItemID: %d, NewStatus: %s", itemID, newStatus)
	return nil
}

// LogVerificationEvent logs a verification event for an item to the Azure SQL Ledger.
// Maps the interface's verificationType to the DB's VerificationStatus.
func (s *AzureSqlLedgerService) LogVerificationEvent(itemID uint, serialNumber string, userID uint, verificationType string) error {
	ctx := context.Background()            // Or use a more specific context if available
	verificationStatus := verificationType // Map interface param to DB column meaning

	log.Printf("AzureSqlLedgerService: Logging Verification Event - ItemID: %d, SN: %s, UserID: %d, Status(Type): %s", itemID, serialNumber, userID, verificationStatus)

	// Validate VerificationStatus (from verificationType) against allowed values in the schema
	allowedStatuses := map[string]bool{"Verified Present": true, "Missing": true, "Requires Attention": true, "Status Unchanged": true}
	if !allowedStatuses[verificationStatus] {
		// Allow any string if validation needs to be less strict? Or return error?
		// Returning error for now to enforce schema constraints.
		return fmt.Errorf("invalid VerificationStatus (from verificationType) '%s' for VerificationEvents", verificationStatus)
	}

	// Notes are not provided by the interface, setting to NULL
	var notesDB sql.NullString

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO HandReceipt.VerificationEvents (ItemID, VerifyingUserID, VerificationStatus, Notes, VerificationTimestamp)
		 VALUES (@p1, @p2, @p3, @p4, SYSUTCDATETIME())`,
		itemID,
		userID, // Map userID from interface to VerifyingUserID
		verificationStatus,
		notesDB, // Pass NULL for Notes
	)

	if err != nil {
		log.Printf("Error logging Verification event to Azure SQL Ledger: %v", err)
		return fmt.Errorf("failed to log Verification event: %w", err)
	}
	log.Printf("Successfully logged Verification Event - ItemID: %d, Status: %s", itemID, verificationStatus)
	return nil
}

// LogMaintenanceEvent logs a maintenance event for an item to the Azure SQL Ledger.
func (s *AzureSqlLedgerService) LogMaintenanceEvent(maintenanceRecordID string, itemID uint, initiatingUserID uint, performingUserID sql.NullInt64, eventType string, maintenanceType sql.NullString, description string) error {
	ctx := context.Background()
	log.Printf("AzureSqlLedgerService: Logging Maintenance Event - RecordID: %s, ItemID: %d, Type: %s", maintenanceRecordID, itemID, eventType)

	// Validate EventType against allowed values
	allowedTypes := map[string]bool{"Scheduled": true, "Started": true, "Completed": true, "Cancelled": true, "Reported Defect": true}
	if !allowedTypes[eventType] {
		return fmt.Errorf("invalid EventType '%s' for MaintenanceEvents", eventType)
	}

	// Ensure performingUserID is null if not applicable
	if eventType != "Started" && eventType != "Completed" {
		performingUserID = sql.NullInt64{}
	}

	_, err := s.db.ExecContext(ctx,
		`INSERT INTO HandReceipt.MaintenanceEvents (MaintenanceRecordID, ItemID, InitiatingUserID, PerformingUserID, EventType, MaintenanceType, Description, EventTimestamp)
		 VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, SYSUTCDATETIME())`,
		maintenanceRecordID,
		itemID,
		initiatingUserID,
		performingUserID,
		eventType,
		maintenanceType, // sql.NullString for nullable NVARCHAR
		sql.NullString{String: description, Valid: description != ""}, // Handle optional description
	)

	if err != nil {
		log.Printf("Error logging Maintenance event to Azure SQL Ledger: %v", err)
		return fmt.Errorf("failed to log Maintenance event: %w", err)
	}
	log.Printf("Successfully logged Maintenance Event - RecordID: %s, ItemID: %d, Type: %s", maintenanceRecordID, itemID, eventType)
	return nil
}

// LogCorrectionEvent logs a correction event referencing a previous ledger event.
// NOTE: How corrections are handled in Azure SQL Ledger needs a defined strategy.
// Common approaches include:
//  1. Using updatable ledger tables (requires specific table creation options).
//  2. Inserting a 'correction' record into a dedicated corrections table or the original table,
//     referencing the transaction ID or EventID of the record being corrected.
//
// This function is a placeholder and needs implementation based on the chosen strategy.
func (s *AzureSqlLedgerService) LogCorrectionEvent(originalEventID string, eventType string, reason string, userID uint) error {
	// ctx := context.Background() // Remove unused ctx for now
	log.Printf("AzureSqlLedgerService: Logging correction event for Original Event: %s (Type: %s) - NOT IMPLEMENTED", originalEventID, eventType)
	// TODO: Implement correction logic based on the chosen strategy for Azure SQL Ledger.
	// Example (Strategy 2: Separate Correction Table):
	/*
		_, err := s.db.ExecContext(ctx,
			`INSERT INTO HandReceipt.CorrectionEvents (OriginalEventID, CorrectingEventType, Reason, CorrectingUserID, CorrectionTimestamp)
			 VALUES (@p1, @p2, @p3, @p4, SYSUTCDATETIME())`,
			originalEventID, // Assuming OriginalEventID is the EventID (GUID) from the original table
			eventType,
			reason,
			userID,
		)
		if err != nil {
			log.Printf("Error logging correction event to Azure SQL Ledger: %v", err)
			return fmt.Errorf("failed to log correction event: %w", err)
		}
		log.Printf("Successfully logged correction event for Original Event: %s", originalEventID)
	*/
	return fmt.Errorf("correction logging not implemented") // Return error until implemented
}

// GetItemHistory retrieves the history of an item from the Azure SQL Ledger tables based on its Serial Number.
// NOTE: This requires querying the system-generated history views for each relevant ledger table.
// It assumes SerialNumber is reliably logged or can be joined across tables if needed.
// A potential challenge is that not all events might directly log the Serial Number.
// Using ItemID might be more robust if SerialNumber isn't in every ledger table.
// For now, we proceed assuming SerialNumber is the primary query key as per the original interface.
func (s *AzureSqlLedgerService) GetItemHistory(serialNumber string) ([]map[string]interface{}, error) {
	ctx := context.Background()
	log.Printf("AzureSqlLedgerService: Getting history for SerialNumber: %s", serialNumber)
	var history []map[string]interface{}

	// TODO: Refine this query significantly. It needs to:
	// 1. Query the correct history views (e.g., HandReceipt.EquipmentEvents_LedgerHistory, HandReceipt.TransferEvents_LedgerHistory, etc.)
	// 2. Select relevant columns from each history view.
	// 3. Filter results based on SerialNumber. This might require JOINs if SerialNumber is not directly in all ledger tables.
	// 4. UNION ALL the results from different history views.
	// 5. Order the combined results appropriately (e.g., by ledger_commit_time or EventTimestamp).
	// 6. Handle potential differences in columns between tables gracefully.
	// 7. Consider creating a stored procedure in Azure SQL for this complex query.

	// Example placeholder query structure (assuming SerialNumber exists in related tables or can be joined):
	// NOTE: This is a simplified example and likely needs modification based on actual primary DB schema and how ItemID relates to SerialNumber.
	query := `
	-- Placeholder Query: Requires joining with primary DB tables to filter by SerialNumber if not present in all ledger tables
	-- This example ASSUMES SerialNumber is accessible via ItemID JOIN, which might be inefficient.
	-- A better approach depends heavily on the primary database schema.

	-- Query EquipmentEvents History (Example: Assume JOIN needed)
	SELECT
		'EquipmentEvent' as RecordType, le.EventID, le.ItemID, le.PerformingUserID, le.EventTimestamp, le.EventType, le.Notes,
		le.ledger_transaction_id, le.ledger_sequence_number, le.ledger_operation_type_desc
	FROM HandReceipt.EquipmentEvents_LedgerHistory le
	-- JOIN YourPrimaryDB.Equipment eq ON le.ItemID = eq.ID -- Replace with actual JOIN
	WHERE 1=2 -- eq.SerialNumber = @p1 -- Placeholder JOIN condition
	UNION ALL
	-- Query TransferEvents History (Example: Assume JOIN needed)
	SELECT
		'TransferEvent' as RecordType, lt.EventID, lt.ItemID, lt.FromUserID, lt.ToUserID, lt.InitiatingUserID, lt.ApprovingUserID, lt.EventTimestamp, lt.EventType, lt.Notes,
		lt.ledger_transaction_id, lt.ledger_sequence_number, lt.ledger_operation_type_desc
	FROM HandReceipt.TransferEvents_LedgerHistory lt
	-- JOIN YourPrimaryDB.Equipment eq ON lt.ItemID = eq.ID -- Replace with actual JOIN
	WHERE 1=2 -- eq.SerialNumber = @p1 -- Placeholder JOIN condition
	-- ... Add UNION ALL clauses for Verification, Maintenance, StatusChange ...
	-- ORDER BY appropriate timestamp
	ORDER BY EventTimestamp ASC; -- Example ordering
	`

	rows, err := s.db.QueryContext(ctx, query, serialNumber)
	if err != nil {
		log.Printf("Error querying item history by SerialNumber from Azure SQL Ledger: %v", err)
		return nil, fmt.Errorf("failed to query item history by SerialNumber: %w", err)
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		log.Printf("Error getting columns for history query: %v", err)
		return nil, fmt.Errorf("failed to get history columns: %w", err)
	}

	for rows.Next() {
		// Create a slice of interface{}\'s to represent the row\'s values.
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		// Scan the result into the column pointers...
		if err := rows.Scan(columnPointers...); err != nil {
			log.Printf("Error scanning history row: %v", err)
			// Consider continuing and logging error vs returning partial history
			return nil, fmt.Errorf("failed to scan history row: %w", err)
		}

		// Create map for the row
		m := make(map[string]interface{})
		for i, colName := range cols {
			val := columnPointers[i].(*interface{})
			// Assign value, handling potential NULLs from the DB explicitly if necessary
			if *val == nil {
				m[colName] = nil
			} else {
				// Convert []byte to string for simplicity, handle other types as needed
				switch v := (*val).(type) {
				case []byte:
					m[colName] = string(v)
				// Add cases for other types (e.g., time.Time) if specific formatting is needed
				default:
					m[colName] = *val
				}
			}
		}
		history = append(history, m)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Error iterating history rows: %v", err)
		return nil, fmt.Errorf("failed during history row iteration: %w", err)
	}

	log.Printf("Retrieved %d history events for SerialNumber: %s", len(history), serialNumber)
	return history, nil
}

// VerifyDocument checks the integrity of the database ledger using Azure SQL Ledger's built-in procedure.
// NOTE: This implementation uses `sys.sp_verify_database_ledger` which verifies the *entire database*.
// The interface parameters `documentID` and `tableName` are currently ignored.
// True verification often involves comparing current database digests with previously stored, trusted digests.
func (s *AzureSqlLedgerService) VerifyDocument(documentID string, tableName string) (bool, error) {
	ctx := context.Background()
	log.Printf("AzureSqlLedgerService: Verifying ledger integrity (Database-wide check). Called with documentID: '%s', tableName: '%s' (parameters ignored).", documentID, tableName)

	// This procedure verifies the integrity of all ledger tables in the database.
	_, err := s.db.ExecContext(ctx, "EXEC sys.sp_verify_database_ledger")
	if err != nil {
		// The error message itself often indicates if verification passed but encountered issues,
		// or if it failed due to tampering. Parsing the specific error might be needed for robust handling.
		log.Printf("Ledger verification stored procedure failed or reported inconsistencies: %v", err)
		// For now, assume any error means verification failed or could not complete.
		return false, fmt.Errorf("ledger verification failed or could not be completed: %w", err)
	}

	// If the stored procedure executes without raising an error, the ledger structures are intact.
	log.Println("Ledger verification procedure executed successfully, indicating ledger integrity.")
	return true, nil
}

// Close cleans up resources, specifically closing the database connection pool.
func (s *AzureSqlLedgerService) Close() error {
	if s.db != nil {
		log.Println("Closing Azure SQL Database connection")
		return s.db.Close()
	}
	return nil
}
