# Hand Receipt - Full Stack Transition Guide

This document outlines the steps required to transition the Hand Receipt application from its current state (React frontend using mock data and IndexedDB) to a fully functional application with a backend service and persistent database.

## 1. Current State

*   **Frontend:** React application built with TypeScript, Vite, and Shadcn UI (located in `client/`).
*   **Data:** Currently uses mock data arrays and IndexedDB for persistence within the browser. This is suitable for development and demonstration but not for a production, multi-user environment.
*   **Blockchain:** Contains placeholder logic for blockchain interaction (commented out or to be removed in this transition).
*   **Existing `server/` dir:** Contains configuration/code potentially related to frontend build/serving (e.g., Vite SSR) - this is *not* the location for the new backend API.

## 2. Goal

To create a fully functional, multi-user application by:

1.  Developing a **separate backend service** (in Rust) to handle business logic and data persistence.
2.  Connecting the frontend to this backend service via API calls.
3.  Replacing all mock data and IndexedDB interactions with API interactions.

## 3. Recommended Project Structure

To accommodate the frontend and backend, the project root should be organized as follows:

```
/
├── client/           # React frontend application (existing)
│   ├── public/
│   ├── src/
│   ├── .env          # Frontend environment variables (VITE_API_BASE_URL)
│   ├── package.json
│   └── ...
├── backend/          # NEW Rust backend API service
│   ├── src/
│   ├── Cargo.toml
│   ├── .env          # Backend environment variables (DATABASE_URL, JWT_SECRET, etc.)
│   └── ...
├── shared/           # Optional: Code shared between frontend and backend (e.g., types)
│   └── ...
├── .gitignore
├── docker-compose.yml # Optional: For running db, backend, frontend together
└── README.md         # This file
```

*   **`client/`**: Contains the existing React frontend code.
*   **`backend/`**: Will contain the new Rust backend service (API) code.
*   **`shared/`**: (Optional) Can be used for code shared between both, like type definitions (requires careful setup).
*   **Root**: Contains overall project configuration.

## 4. Backend Setup (To be done in `backend/` directory)

This involves creating a new Rust application within the `backend/` directory.

*   **Initialize Rust Project:**
    *   Navigate to the root directory.
    *   Create the backend directory: `mkdir backend && cd backend`
    *   Initialize a new Rust binary project: `cargo init --bin`
*   **Choose Web Framework:**
    *   Select a Rust web framework (e.g., Actix Web, Axum, Rocket) and add it to `backend/Cargo.toml`.
*   **Choose Database & ORM/Driver:**
    *   Select a database (e.g., PostgreSQL recommended).
    *   Choose a corresponding Rust database driver (e.g., `sqlx`, `diesel`, `tokio-postgres`). Add it to `backend/Cargo.toml`.
*   **Design Database Schema:**
    *   Define tables based on `client/src/types/index.ts`.
    *   Use migrations (e.g., `sqlx-cli`, `diesel_cli`) to manage schema changes.
*   **Implement API Endpoints:**
    *   Create modules for different features (inventory, transfers, maintenance, auth).
    *   Define request/response structs (often using `serde` for JSON serialization/deserialization).
    *   Implement RESTful API endpoints covering CRUD operations for all resources.
    *   Handle database interactions within your request handlers.
*   **Implement Authentication & Authorization:**
    *   Add libraries for password hashing (e.g., `argon2`, `bcrypt`).
    *   Implement login/registration handlers.
    *   Use a JWT library (e.g., `jsonwebtoken`) or session management to handle user sessions.
    *   Create middleware or use framework features to protect endpoints.
*   **Environment Variables:**
    *   Use a `.env` file within the `backend/` directory to manage database connection strings, JWT secrets, server ports, etc. Use a library like `dotenvy` to load them.
*   **CORS:**
    *   Configure Cross-Origin Resource Sharing (CORS) middleware in your Rust backend to allow requests from your frontend development server (e.g., `http://localhost:5173`).

## 5. Frontend Refactoring (In `client/` directory - To Do)

This involves modifying the existing React code in the `client` directory.

*   **Set up API Client:**
    *   Create a centralized module (`client/src/lib/apiClient.ts` or similar) using `fetch` or `axios`.
    *   Configure it to use the `VITE_API_BASE_URL` environment variable and include authentication tokens.
*   **Environment Variables:**
    *   Create `client/.env` with `VITE_API_BASE_URL=http://localhost:8000/api` (adjust port/path as needed).
*   **Remove Mock Data & IndexedDB:**
    *   Delete or comment out imports from mock data files.
    *   Remove functions and calls related to IndexedDB.
*   **Implement Data Fetching:**
    *   Replace data reads with API calls using the `apiClient`.
    *   **Recommendation:** Use `react-query` (`@tanstack/react-query`) or `SWR` for server state management.
*   **Implement Data Mutations:**
    *   Refactor functions modifying data to send API requests (`POST`, `PUT`, `DELETE`) via the `apiClient`.
*   **Integrate Authentication:**
    *   Update `AuthContext` to call backend auth endpoints.
    *   Store auth tokens securely.
    *   Include tokens in API requests.
*   **Add Loading & Error States:**
    *   Implement robust loading and error handling for all API interactions.
*   **Remove Blockchain Code:**
    *   Remove all blockchain-related logic.

## 6. Running the Application

*   **Backend (Rust):**
    1.  Navigate to the `backend` directory: `cd backend`
    2.  Ensure your database is running.
    3.  Create/configure the `.env` file with database URL, etc.
    4.  Run the backend server: `cargo run`
*   **Frontend (React):**
    1.  Navigate to the `client` directory: `cd ../client` (from backend) or `cd client` (from root)
    2.  Install dependencies: `npm install` (or `yarn install`)
    3.  Create/configure the `.env` file with `VITE_API_BASE_URL` pointing to your running backend.
    4.  Run the development server: `npm run dev` (or `yarn dev`)
    5.  Access the application in your browser (usually `http://localhost:5173`).

## 7. Technology Stack (Target)

*   **Frontend:** React, TypeScript, Vite, Shadcn UI, Tailwind CSS, Lucide Icons, Recharts, (`react-query` or `SWR` recommended)
*   **Backend:** Rust (e.g., Actix Web, Axum) + PostgreSQL (Recommended)
*   **Database:** PostgreSQL / MySQL / MongoDB (TBD)
*   **Authentication:** JWT or Session-based 