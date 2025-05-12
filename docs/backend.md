# Backend Architecture (`server/`)

This document details the backend architecture of the ReqQuestTracker application, located within the `server/` directory.

## 1. Overview

The backend is built using Express.js, a minimal and flexible Node.js web application framework. It handles API requests, interacts with the PostgreSQL database via Drizzle ORM, and manages user authentication using Passport.js.

## 2. Entry Point (`server/index.ts`)

The main entry point for the backend server is `server/index.ts`. Here's a breakdown of its responsibilities:

*   **Initialization:** Creates an Express application instance.
*   **Middleware Setup:**
    *   `express.json()`: Parses incoming request bodies with JSON payloads.
    *   `express.urlencoded({ extended: false })`: Parses incoming request bodies with URL-encoded payloads.
    *   **Custom Logging Middleware:** A detailed request logger is implemented for API calls (paths starting with `/api`). It logs:
        *   HTTP Method (e.g., GET, POST)
        *   Request Path
        *   Response Status Code
        *   Request Duration (in milliseconds)
        *   A snippet of the JSON response body (truncated if too long).
        This logging is facilitated by a `log` function, likely imported from `server/vite.ts` or a similar utility.
*   **Route Registration:**
    *   The `registerRoutes(app)` function (from `server/routes.ts`) is called to define and attach all API endpoints to the Express app.
*   **Error Handling:**
    *   A global error handling middleware is defined. It catches errors passed through `next(err)` and responds with a JSON object containing `{ message: err.message }` and an appropriate HTTP status code (defaulting to 500).
*   **Client Serving & Vite Integration:**
    *   **Development Mode (`app.get("env") === "development"`):**
        *   `setupVite(app, server)` (from `server/vite.ts`) is called. This integrates the Vite development server, likely for serving the client-side React application with Hot Module Replacement (HMR) capabilities.
    *   **Production Mode:**
        *   `serveStatic(app)` (from `server/vite.ts`) is called. This serves the static frontend assets, presumably built by Vite into the `dist/` directory.
*   **Server Listening:**
    *   The server listens on port `7000` and host `0.0.0.0`. The comments indicate this port is specifically chosen as it's the only one not firewalled and serves both the API and the client application.

```typescript
// Snippet from server/index.ts (illustrative)
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// ... middleware ...

(async () => {
  const server = await registerRoutes(app);

  // ... error handling ...

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 7000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });
})();
```

## 3. API Routes (`server/routes.ts`)

The API routes are defined within the `server/routes.ts` file, inside the `registerRoutes` asynchronous function. This function is called by `server/index.ts` to attach the routes to the Express application.

All data operations within the routes are delegated to a `storage` module, imported from `./storage.ts`. Request payload validation (for POST requests) is performed using Zod schemas imported from `@shared/schema`.

**Key Endpoints:**

*   **`GET /api/workout-data/:userId`**
    *   **Description:** Fetches workout data for a specific user.
    *   **Parameters:** `userId` (route parameter) - The ID of the user.
    *   **Logic:** Parses `userId`, calls `storage.getWorkoutData(userId)`.
    *   **Response:** JSON object containing the user's workout data (specifically `workoutData.data`) or `null` if not found. Returns 400 for an invalid `userId` and 500 for other errors.

*   **`POST /api/workout-data`**
    *   **Description:** Saves new workout data for a user.
    *   **Request Body:** Expects a JSON object matching the `insertWorkoutDataSchema` (defined in `@shared/schema`).
    *   **Logic:** Validates the request body. If valid, calls `storage.saveWorkoutData(validatedData)`.
    *   **Response:** JSON object of the saved workout data. Returns 400 for invalid data (with Zod error details) and 500 for other errors.

*   **`POST /api/sync-drive`**
    *   **Description:** Placeholder endpoint intended for syncing workout data with Google Drive.
    *   **Logic:** Currently returns a static success message (`{ success: true, message: "Sync completed" }`).
    *   **Response:** JSON success message or 500 for errors.

*   **`GET /api/lifts`**
    *   **Description:** Fetches a list of available lifts.
    *   **Logic:** Uses a hardcoded `userId = 1` (for demo purposes) and calls `storage.getLifts(userId)`.
    *   **Response:** JSON array of lifts or 500 for errors.

**Error Handling:**
Each route includes `try...catch` blocks for basic error handling, logging errors to the console and returning appropriate HTTP status codes (typically 500 for server errors, 400 for client errors like invalid input).

**Authentication:**
Explicit user authentication middleware (like Passport.js session checks) is not directly visible within this `routes.ts` file for the defined API endpoints. User identification for fetching data (e.g., `userId` from path parameters) appears to be direct. This might be handled elsewhere, be planned for future implementation, or simplified for current functionality.

The `registerRoutes` function also creates and returns an `http.Server` instance, which is then used in `server/index.ts` to start listening for requests.

```typescript
// Snippet from server/routes.ts (illustrative)
import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertWorkoutDataSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // GET /api/workout-data/:userId
  app.get("/api/workout-data/:userId", async (req: Request, res: Response) => {
    // ... implementation ...
  });

  // POST /api/workout-data
  app.post("/api/workout-data", async (req: Request, res: Response) => {
    // ... implementation ...
  });

  // ... other routes ...
  
  const httpServer = createServer(app);
  return httpServer;
}
```

## 4. Database Interaction (`server/db.ts`)

The application uses [Drizzle ORM](https://orm.drizzle.team/) to interact with a PostgreSQL database, hosted on [NeonDB](https://neon.tech/) (as indicated by the `@neondatabase/serverless` driver).

The database connection and Drizzle instance are configured in `server/db.ts`.

Key aspects of `server/db.ts`:

*   **NeonDB Serverless Driver:** It utilizes `Pool` and `neonConfig` from `@neondatabase/serverless`.
    *   A WebSocket constructor (`ws`) is explicitly provided to `neonConfig.webSocketConstructor`, which is a common requirement for the Neon serverless driver in Node.js environments.
*   **Environment Variable:** The database connection relies on the `DATABASE_URL` environment variable. The application will throw an error on startup if this variable is not set.
*   **Connection Pool:** A connection pool (`pool`) is created using the `DATABASE_URL`.
*   **Drizzle ORM Instance:** The main Drizzle instance (`db`) is initialized with:
    *   `client: pool`: The NeonDB serverless connection pool.
    *   `schema`: The database schema, imported from `@shared/schema`. This signifies that table definitions, relations, and types are located in the `shared/` directory, allowing them to be potentially used by both backend and frontend (or for ORM tooling).

```typescript
// Snippet from server/db.ts (illustrative)
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema"; // Schema definitions

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

Database schema migrations or pushes are handled by the `npm run db:push` script, which uses `drizzle-kit` as defined in `package.json` and configured in `drizzle.config.ts`.

## 5. Data Storage Layer (`server/storage.ts`)

A critical component of the backend is the storage layer defined in `server/storage.ts`. This file introduces an abstraction for data persistence through an `IStorage` interface and provides an in-memory implementation called `MemStorage`.

**Currently, the application uses `MemStorage`, meaning all data is stored in memory and will be lost when the server restarts.**

Key aspects of `server/storage.ts`:

*   **`IStorage` Interface:** Defines a contract for all data operations. This includes methods for managing:
    *   Users (`User`, `InsertUser`)
    *   Lifts/Exercises (`Lift`, `InsertLift`)
    *   Workout Splits (`Split`, `InsertSplit`) - including setting an active split.
    *   Days within a Split (`Day`, `InsertDay`)
    *   Lifts scheduled for a Day (`DayLift`, `InsertDayLift`)
    *   Workouts (`Workout`, `InsertWorkout`) - including completing a workout.
    *   Sets within a Workout (`Set`, `InsertSet`) - including completing a set.
    *   Generic Workout Data (`WorkoutData`, `InsertWorkoutData`) - This is what the current API routes primarily interact with.
    This interface design allows for future swapping of the storage implementation (e.g., to a database-backed version using Drizzle ORM) without altering the API route handlers significantly.

*   **`MemStorage` Class:** An in-memory implementation of `IStorage`.
    *   It uses JavaScript `Map` objects to store all application data (users, lifts, splits, etc.).
    *   Handles auto-incrementing IDs for new entities.
    *   The `saveWorkoutData` method performs an "upsert": it updates existing data if found for a `userId`, otherwise creates a new entry.
    *   **This class does NOT interact with the Drizzle ORM or the database configured in `server/db.ts`.**

*   **Exported `storage` Instance:**
    *   The file exports a singleton instance: `export const storage = new MemStorage();`.
    *   This `storage` instance is imported and used by `server/routes.ts` to handle all data persistence logic.

*   **Schema Usage:**
    *   Both `IStorage` and `MemStorage` make extensive use of data types (e.g., `User`, `Lift`, `InsertUser`, `InsertLift`) imported from `@shared/schema.ts`. This ensures that the in-memory data structures align with the intended database schema.

**Implications for Developers:**

*   **No Data Persistence:** Any data added or modified during a session will not survive a server restart.
*   **Path to Persistence:** The `IStorage` interface and the existing Drizzle setup in `server/db.ts` (along with `@shared/schema.ts`) provide a clear path to implementing persistent storage. A new class, say `DrizzleStorage implements IStorage`, would need to be created, utilizing the `db` instance from `server/db.ts` to perform Drizzle ORM operations against the PostgreSQL database.
*   **Full Data Model:** While the current API in `server/routes.ts` only exposes `workout-data` and `lifts`, the `storage.ts` file reveals a much richer underlying data model for a comprehensive workout tracking application.

## 6. Authentication

(Details to be added, likely involving Passport.js setup, strategies, and session management found in `routes.ts` or dedicated auth files.)

## 7. Vite Integration & Static Serving (`server/vite.ts`)

(Details to be added after inspecting `server/vite.ts`) 