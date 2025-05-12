# RepQuestTracker Documentation

## 1. Overview

ReqQuestTracker is a full-stack web application designed to track the resistance training workouts of the user.

This document provides a comprehensive guide for developers to understand the architecture, codebase, setup, and deployment of the ReqQuestTracker application.

## 2. Technology Stack

The application leverages a modern technology stack:

*   **Frontend:**
    *   Framework: React
    *   Build Tool: Vite
    *   Routing: Wouter
    *   State Management/Data Fetching: TanStack Query (React Query)
    *   Styling: Tailwind CSS
    *   UI Components: Radix UI, shadcn/ui (inferred), Lucide Icons
*   **Backend:**
    *   Framework: Express.js
    *   Language: TypeScript
    *   Database: PostgreSQL (likely via NeonDB)
    *   ORM: Drizzle ORM
    *   Authentication: Passport.js (local strategy)
*   **Shared:**
    *   Schema Definition & Validation: Zod
*   **Build & Development:**
    *   Node.js
    *   tsx (TypeScript execution)
    *   esbuild (JavaScript bundler and minifier)
    *   TypeScript

## 3. Project Structure (Initial Overview)

```
/
├── .git/                   # Git version control files
├── .replit                 # Replit configuration file
├── package.json            # Project metadata, dependencies, and scripts
├── package-lock.json       # Exact versions of dependencies
├── node_modules/           # Installed Node.js packages
├── dist/                   # Production build output
├── .env                    # Environment variables (empty by default)
├── shared/                 # Code shared between client and server (e.g., types, validation schemas)
├── server/                 # Backend (Express.js) application code
│   └── index.ts            # Main entry point for the server
├── client/                 # Frontend (React) application code
├── attached_assets/        # Assets attached for development/reference
├── vite.config.ts          # Vite configuration for the frontend
├── tsconfig.json           # TypeScript compiler options
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── generated-icon.png      # Application icon
├── drizzle.config.ts       # Drizzle ORM configuration
├── components.json         # shadcn/ui component configuration (inferred)
├── .gitignore              # Files and directories to be ignored by Git
└── docs/                   # Documentation (this folder)
    └── README.md           # This file
```

## 4. Setup and Running the Application

### Prerequisites

*   Node.js (version specified in `.nvmrc` or project docs, if available - otherwise latest LTS)
*   npm or yarn (based on `package-lock.json`, npm is used)
*   Access to a PostgreSQL database.

### Environment Variables

Create a `.env` file in the root directory and populate it with the necessary environment variables. Based on the dependencies, this will likely include:

*   `DATABASE_URL`: Connection string for your PostgreSQL database.
*   `SESSION_SECRET`: A secret key for session management.
*   Other potential variables related to authentication or specific service integrations.

**(Further details on required .env variables will be added as discovered.)**

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd RepQuestTracker
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running in Development

```bash
npm run dev
```
This will start the backend server (typically on a port like 3000 or 3001) and the frontend development server (often on port 5173 via Vite).

### Building for Production

```bash
npm run build
```
This command will build the frontend application and the backend server, placing the output in the `dist/` directory.

### Running in Production

```bash
npm run start
```
This will serve the production-ready application from the `dist/` folder.

### Database Migrations/Push

To apply schema changes to the database (using Drizzle ORM):
```bash
npm run db:push
```

## 5. Next Steps in Documentation

The following sections will be detailed further:

*   **Backend Architecture (`docs/backend.md`):**
    *   Server entry point (`server/index.ts`)
    *   API routes and controllers
    *   Middleware (authentication, error handling)
    *   Database schema and Drizzle ORM usage
    *   Authentication flow with Passport.js
*   **Frontend Architecture (`docs/frontend.md`):**
    *   Main entry point and component structure
    *   Routing with Wouter
    *   State management with TanStack Query
    *   UI components (Radix, shadcn/ui)
    *   API service calls
*   **Shared Code (`docs/shared.md`):**
    *   Zod schemas for validation
    *   TypeScript types shared between client and server.

---
*This documentation is actively being developed.* 