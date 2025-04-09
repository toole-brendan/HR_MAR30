# HandReceipt Data Boundaries

This document clarifies the separation of data between the primary PostgreSQL operational database and the Azure SQL Database Ledger, which serves as the immutable audit trail.

## PostgreSQL (Operational Database)

Stores the **current state** of the system. This includes:

*   **brendantoole**: User accounts, credentials (hashed passwords), roles, contact information.
*   ****: The current master list of all equipment/property items. Contains current status, current assignment (user ID), serial number, description, link to reference model (), last verification/maintenance timestamps, etc.
*   ****: Reference data defining broad categories of equipment (e.g., Weapon, Comms).
*   ****: Reference data defining specific equipment models (e.g., M4 Carbine, AN/PRC-152), including NSN, manufacturer, specifications, image URLs.
*   ****: Represents the *current state* of active or recently completed transfer requests (e.g., status like Requested, Approved, Completed). This might be pruned or archived periodically, relying on the ledger for full history.
*   **(Potentially)**  / : Current scheduled maintenance or potentially summary records of the *last* maintenance.
*   **Session Data**: User session information ( table).

**Purpose**: Fast querying of the current state, enforcing relational integrity (foreign keys), supporting application workflows.

## Azure SQL Database Ledger (Audit Trail)

Stores an **immutable history of significant events**. This is append-only and cryptographically verifiable. It includes:

*   ****: Records of item creation/registration and decommissioning.
*   ****: Records *each step* of a transfer workflow (Requested, Approved, Rejected, Completed, Cancelled). Links Transfer Request ID, Item ID, involved User IDs, timestamps.
*   ****: Records of sensitive item verification checks (who verified, when, what was the status - Verified Present, Missing, etc.).
*   ****: Records changes to an item's operational status (e.g., Operational -> In Repair, Lost -> Found). Records who reported, when, old/new status.
*   ****: Records *each step* of a maintenance process (Scheduled, Started, Completed, Cancelled, Defect Reported). Includes Item ID, User IDs, timestamps, type of maintenance.
*   **(Potentially)** : If implemented, records corrections made to previous ledger entries, referencing the original event and providing a reason.

**Purpose**: Provide a verifiable, tamper-evident audit log of all critical actions and state changes related to equipment accountability and movement. Used for auditing, historical analysis, and proving chain of custody.

## Key Distinction

*   **PostgreSQL**: What is the state *now*?
*   **Azure SQL Ledger**: What *happened* over time?

The Ledger does **not** replace the operational database for current state queries. It complements it by providing the historical, verifiable proof of actions.