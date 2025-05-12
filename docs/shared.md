# Shared Code and Data Models (`shared/`)

This document describes the shared code, primarily focusing on the data models (database schema) defined in `shared/schema.ts`. This schema is fundamental to the application, as it defines the structure of data for both the Drizzle ORM (intended for database interaction) and the current in-memory storage (`MemStorage`).

## 1. Overview of `shared/schema.ts`

The `shared/schema.ts` file uses Drizzle ORM's `pgTable` syntax to define tables for a PostgreSQL database. It also leverages `drizzle-zod` to create Zod schemas for data validation (especially for insert operations) and derives TypeScript types for use throughout the application.

## 2. Database Table Definitions

Below are the definitions of the tables as specified in `shared/schema.ts`.

### 2.1. `users` Table

Stores user account information.

*   `id` (SERIAL, Primary Key): Unique identifier for the user.
*   `username` (TEXT, Not Null, Unique): User's chosen username.
*   `password` (TEXT, Not Null): User's hashed password.
*   `createdAt` (TIMESTAMP, Not Null, Default: NOW()): Timestamp of when the user account was created.

### 2.2. `lifts` Table

Stores information about predefined exercises or lifts.

*   `id` (SERIAL, Primary Key): Unique identifier for the lift.
*   `name` (TEXT, Not Null): Name of the exercise (e.g., "Bench Press", "Squat").
*   `defaultWeight` (INTEGER, Not Null): A default or starting weight for this lift.
*   `weightIncrement` (INTEGER, Not Null): The typical increment value for this lift's weight.
*   `userId` (INTEGER, Foreign Key -> `users.id`, On Delete: Cascade): Associates the lift with a user, allowing for custom lifts. Can be `NULL` for global/default lifts (though current insert schema might enforce it).

### 2.3. `splits` Table

Represents workout routines or training programs (splits).

*   `id` (SERIAL, Primary Key): Unique identifier for the split.
*   `name` (TEXT, Not Null): Name of the workout split (e.g., "Push-Pull-Legs").
*   `isActive` (BOOLEAN, Default: false): Indicates if this is the user's currently active workout split.
*   `userId` (INTEGER, Foreign Key -> `users.id`, On Delete: Cascade, Not Null): Links the split to a specific user.

### 2.4. `days` Table

Defines individual training days within a workout split.

*   `id` (SERIAL, Primary Key): Unique identifier for the day.
*   `name` (TEXT, Not Null): Name of the training day (e.g., "Push Day 1", "Workout A").
*   `splitId` (INTEGER, Foreign Key -> `splits.id`, On Delete: Cascade, Not Null): Links the day to its parent split.
*   `dayOrder` (INTEGER, Not Null): Specifies the order of this day within the split.

### 2.5. `day_lifts` Table

Junction table mapping specific lifts to particular days in a split, defining the exercises for that day.

*   `id` (SERIAL, Primary Key): Unique identifier for the day-lift association.
*   `dayId` (INTEGER, Foreign Key -> `days.id`, On Delete: Cascade, Not Null): Links to the specific day.
*   `liftId` (INTEGER, Foreign Key -> `lifts.id`, Not Null): Links to the specific lift.
*   `liftOrder` (INTEGER, Not Null): Specifies the order of this lift within the day's workout plan.

### 2.6. `workouts` Table

Records actual workout sessions that a user has performed.

*   `id` (SERIAL, Primary Key): Unique identifier for the workout session.
*   `date` (TIMESTAMP, Not Null, Default: NOW()): The date and time the workout was performed.
*   `userId` (INTEGER, Foreign Key -> `users.id`, On Delete: Cascade, Not Null): Links the workout to the user who performed it.
*   `dayId` (INTEGER, Foreign Key -> `days.id`, Nullable): Optionally links the workout to a specific planned day from a split.
*   `completed` (BOOLEAN, Default: false): Indicates whether the workout session is considered completed.

### 2.7. `sets` Table

Records individual sets performed by a user for a specific lift within a workout session.

*   `id` (SERIAL, Primary Key): Unique identifier for the set.
*   `workoutId` (INTEGER, Foreign Key -> `workouts.id`, On Delete: Cascade, Not Null): Links the set to its parent workout session.
*   `liftId` (INTEGER, Foreign Key -> `lifts.id`, Not Null): Links to the lift performed during this set.
*   `weight` (INTEGER, Not Null): The weight used for this set.
*   `reps` (INTEGER, Not Null): The number of repetitions performed.
*   `setOrder` (INTEGER, Not Null): The order of this set for the given lift within the workout.
*   `completed` (BOOLEAN, Default: false): Indicates whether the set was completed.

### 2.8. `workout_data` Table

Provides a more flexible way to store workout-related information as a JSON blob. This table is currently used by the primary API endpoints (`/api/workout-data`).

*   `id` (SERIAL, Primary Key): Unique identifier for the workout data entry.
*   `userId` (INTEGER, Foreign Key -> `users.id`, On Delete: Cascade, Not Null): Links the data to a specific user.
*   `data` (JSON, Not Null): Stores the arbitrary JSON data associated with the user's workout.

## 3. Zod Schemas for Validation

For each table, `drizzle-zod` is used to generate Zod schemas, primarily for validating data upon insertion. These are typically named `insert<TableName>Schema` (e.g., `insertUserSchema`). These schemas often use Zod's `.pick()` method to select only the fields required or allowed during creation.

Example (`insertUserSchema`):
```typescript
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
```

## 4. TypeScript Type Definitions

Corresponding TypeScript types are also defined for each table, for both "insert" and "select" (retrieved data) scenarios:

*   **Insert Types:** Derived from Zod schemas (e.g., `export type InsertUser = z.infer<typeof insertUserSchema>;`).
*   **Select Types:** Derived directly from Drizzle table definitions (e.g., `export type User = typeof users.$inferSelect;`).

These types provide static type checking and improve developer experience throughout the codebase.

## 5. Relationships and Data Flow

The schema describes a comprehensive fitness tracking application:

*   A `User` can have multiple workout `Splits`.
*   A `Split` consists of multiple `Days`.
*   Each `Day` can have multiple `Lifts` assigned to it via the `day_lifts` table.
*   Users can create custom `Lifts` or use predefined ones.
*   When a user performs a workout, it's recorded as a `Workout` entry, potentially linked to a `Day` from their active `Split`.
*   Each `Workout` consists of multiple `Sets`, where each set details the `Lift`, `weight`, and `reps`.
*   The `workout_data` table offers a more generic alternative or supplementary way to store user workout information, currently leveraged by the `/api/workout-data` endpoint.

The foreign key relationships with `onDelete: "cascade"` ensure that related data is cleaned up appropriately (e.g., if a user is deleted, their splits, workouts, etc., are also deleted). 