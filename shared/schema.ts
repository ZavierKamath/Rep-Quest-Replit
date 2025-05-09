import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Lifts Table (predefined exercises)
export const lifts = pgTable("lifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  defaultWeight: integer("default_weight").notNull(),
  weightIncrement: integer("weight_increment").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" })
});

// Splits Table (workout routines)
export const splits = pgTable("splits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(false),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull()
});

// Days Table (days within splits)
export const days = pgTable("days", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  splitId: integer("split_id").references(() => splits.id, { onDelete: "cascade" }).notNull(),
  dayOrder: integer("day_order").notNull()
});

// Day Lifts Table (exercises for each day)
export const dayLifts = pgTable("day_lifts", {
  id: serial("id").primaryKey(),
  dayId: integer("day_id").references(() => days.id, { onDelete: "cascade" }).notNull(),
  liftId: integer("lift_id").references(() => lifts.id).notNull(),
  liftOrder: integer("lift_order").notNull()
});

// Workouts Table (completed workout sessions)
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  dayId: integer("day_id").references(() => days.id),
  completed: boolean("completed").default(false)
});

// Sets Table (sets within workouts)
export const sets = pgTable("sets", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").references(() => workouts.id, { onDelete: "cascade" }).notNull(),
  liftId: integer("lift_id").references(() => lifts.id).notNull(),
  weight: integer("weight").notNull(),
  reps: integer("reps").notNull(),
  setOrder: integer("set_order").notNull(),
  completed: boolean("completed").default(false)
});

// Workout Data Table (for storing JSON data)
export const workoutData = pgTable("workout_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  data: json("data").notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const insertLiftSchema = createInsertSchema(lifts).pick({
  name: true, 
  defaultWeight: true,
  weightIncrement: true,
  userId: true
});

export const insertSplitSchema = createInsertSchema(splits).pick({
  name: true,
  isActive: true,
  userId: true
});

export const insertDaySchema = createInsertSchema(days).pick({
  name: true,
  splitId: true,
  dayOrder: true
});

export const insertDayLiftSchema = createInsertSchema(dayLifts).pick({
  dayId: true,
  liftId: true, 
  liftOrder: true
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  date: true,
  userId: true,
  dayId: true,
  completed: true
});

export const insertSetSchema = createInsertSchema(sets).pick({
  workoutId: true,
  liftId: true,
  weight: true,
  reps: true,
  setOrder: true,
  completed: true
});

export const insertWorkoutDataSchema = createInsertSchema(workoutData).pick({
  userId: true,
  data: true
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLift = z.infer<typeof insertLiftSchema>;
export type Lift = typeof lifts.$inferSelect;

export type InsertSplit = z.infer<typeof insertSplitSchema>;
export type Split = typeof splits.$inferSelect;

export type InsertDay = z.infer<typeof insertDaySchema>;
export type Day = typeof days.$inferSelect;

export type InsertDayLift = z.infer<typeof insertDayLiftSchema>;
export type DayLift = typeof dayLifts.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertSet = z.infer<typeof insertSetSchema>;
export type Set = typeof sets.$inferSelect;

export type InsertWorkoutData = z.infer<typeof insertWorkoutDataSchema>;
export type WorkoutData = typeof workoutData.$inferSelect;
