// Lift type (exercise)
export interface Lift {
  id: string;
  name: string;
  defaultWeight: number;
  weightIncrement: number;
  icon?: string;
}

// Day in a split
export interface Day {
  name: string;
  lifts: string[]; // Lift IDs
}

// Workout split
export interface Split {
  id: string;
  name: string;
  days: Day[];
}

// Workout (instance of a lift in a day)
export interface Workout {
  id: string;
  liftId: string;
  name: string;
  defaultWeight: number;
  defaultSets: number;
  repRange: string;
  weightIncrement: number;
  order: number;
}

// Set (a single set of an exercise)
export interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

// Lift history record
export interface LiftHistoryRecord {
  date: string; // ISO date string
  sets: Set[];
}

// Lift history
export interface LiftHistory {
  [liftId: string]: LiftHistoryRecord[];
}

// Workout state
export interface WorkoutState {
  currentSplitId: string;
  currentDayIndex: number;
  activeWorkoutId: string | null;
  completedWorkoutIds: string[];
  workoutSets: Record<string, Set[]>;
  lastWeights: Record<string, number>;
  workoutDays: string[]; // ISO date strings of workout days
}

// User data
export interface UserData {
  lifts: Lift[];
  splits: Split[];
  liftHistory: LiftHistory;
  workoutState: WorkoutState;
}
