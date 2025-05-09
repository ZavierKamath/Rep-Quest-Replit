import {
  User,
  InsertUser,
  Lift,
  InsertLift,
  Split,
  InsertSplit,
  Day,
  InsertDay,
  DayLift,
  InsertDayLift,
  Workout,
  InsertWorkout,
  Set,
  InsertSet,
  WorkoutData,
  InsertWorkoutData
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lift operations
  getLift(id: number): Promise<Lift | undefined>;
  getLifts(userId: number): Promise<Lift[]>;
  createLift(lift: InsertLift): Promise<Lift>;
  updateLift(id: number, lift: Partial<InsertLift>): Promise<Lift | undefined>;
  
  // Split operations
  getSplit(id: number): Promise<Split | undefined>;
  getSplits(userId: number): Promise<Split[]>;
  createSplit(split: InsertSplit): Promise<Split>;
  updateSplit(id: number, split: Partial<InsertSplit>): Promise<Split | undefined>;
  setActiveSplit(userId: number, splitId: number): Promise<Split>;
  
  // Day operations
  getDaysForSplit(splitId: number): Promise<Day[]>;
  createDay(day: InsertDay): Promise<Day>;
  
  // DayLift operations
  getLiftsForDay(dayId: number): Promise<DayLift[]>;
  createDayLift(dayLift: InsertDayLift): Promise<DayLift>;
  
  // Workout operations
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkoutsForUser(userId: number): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  completeWorkout(id: number): Promise<Workout | undefined>;
  
  // Set operations
  getSetsForWorkout(workoutId: number): Promise<Set[]>;
  createSet(set: InsertSet): Promise<Set>;
  completeSet(id: number): Promise<Set | undefined>;
  
  // Workout data operations (for JSON storage)
  getWorkoutData(userId: number): Promise<WorkoutData | undefined>;
  saveWorkoutData(data: InsertWorkoutData): Promise<WorkoutData>;
  updateWorkoutData(userId: number, data: any): Promise<WorkoutData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lifts: Map<number, Lift>;
  private splits: Map<number, Split>;
  private days: Map<number, Day>;
  private dayLifts: Map<number, DayLift>;
  private workouts: Map<number, Workout>;
  private sets: Map<number, Set>;
  private workoutData: Map<number, WorkoutData>;
  
  private currentUserId: number;
  private currentLiftId: number;
  private currentSplitId: number;
  private currentDayId: number;
  private currentDayLiftId: number;
  private currentWorkoutId: number;
  private currentSetId: number;
  private currentWorkoutDataId: number;
  
  constructor() {
    this.users = new Map();
    this.lifts = new Map();
    this.splits = new Map();
    this.days = new Map();
    this.dayLifts = new Map();
    this.workouts = new Map();
    this.sets = new Map();
    this.workoutData = new Map();
    
    this.currentUserId = 1;
    this.currentLiftId = 1;
    this.currentSplitId = 1;
    this.currentDayId = 1;
    this.currentDayLiftId = 1;
    this.currentWorkoutId = 1;
    this.currentSetId = 1;
    this.currentWorkoutDataId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Lift operations
  async getLift(id: number): Promise<Lift | undefined> {
    return this.lifts.get(id);
  }
  
  async getLifts(userId: number): Promise<Lift[]> {
    return Array.from(this.lifts.values()).filter(
      (lift) => lift.userId === userId || lift.userId === null
    );
  }
  
  async createLift(insertLift: InsertLift): Promise<Lift> {
    const id = this.currentLiftId++;
    const lift: Lift = { ...insertLift, id };
    this.lifts.set(id, lift);
    return lift;
  }
  
  async updateLift(id: number, liftData: Partial<InsertLift>): Promise<Lift | undefined> {
    const lift = this.lifts.get(id);
    if (!lift) return undefined;
    
    const updatedLift = { ...lift, ...liftData };
    this.lifts.set(id, updatedLift);
    return updatedLift;
  }
  
  // Split operations
  async getSplit(id: number): Promise<Split | undefined> {
    return this.splits.get(id);
  }
  
  async getSplits(userId: number): Promise<Split[]> {
    return Array.from(this.splits.values()).filter(
      (split) => split.userId === userId
    );
  }
  
  async createSplit(insertSplit: InsertSplit): Promise<Split> {
    const id = this.currentSplitId++;
    const split: Split = { ...insertSplit, id };
    this.splits.set(id, split);
    return split;
  }
  
  async updateSplit(id: number, splitData: Partial<InsertSplit>): Promise<Split | undefined> {
    const split = this.splits.get(id);
    if (!split) return undefined;
    
    const updatedSplit = { ...split, ...splitData };
    this.splits.set(id, updatedSplit);
    return updatedSplit;
  }
  
  async setActiveSplit(userId: number, splitId: number): Promise<Split> {
    // Deactivate all splits for this user
    for (const split of this.splits.values()) {
      if (split.userId === userId && split.isActive) {
        this.splits.set(split.id, { ...split, isActive: false });
      }
    }
    
    // Activate the requested split
    const split = this.splits.get(splitId);
    if (!split) {
      throw new Error(`Split with ID ${splitId} not found`);
    }
    
    const activatedSplit = { ...split, isActive: true };
    this.splits.set(splitId, activatedSplit);
    return activatedSplit;
  }
  
  // Day operations
  async getDaysForSplit(splitId: number): Promise<Day[]> {
    return Array.from(this.days.values())
      .filter((day) => day.splitId === splitId)
      .sort((a, b) => a.dayOrder - b.dayOrder);
  }
  
  async createDay(insertDay: InsertDay): Promise<Day> {
    const id = this.currentDayId++;
    const day: Day = { ...insertDay, id };
    this.days.set(id, day);
    return day;
  }
  
  // DayLift operations
  async getLiftsForDay(dayId: number): Promise<DayLift[]> {
    return Array.from(this.dayLifts.values())
      .filter((dayLift) => dayLift.dayId === dayId)
      .sort((a, b) => a.liftOrder - b.liftOrder);
  }
  
  async createDayLift(insertDayLift: InsertDayLift): Promise<DayLift> {
    const id = this.currentDayLiftId++;
    const dayLift: DayLift = { ...insertDayLift, id };
    this.dayLifts.set(id, dayLift);
    return dayLift;
  }
  
  // Workout operations
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }
  
  async getWorkoutsForUser(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter((workout) => workout.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first
  }
  
  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentWorkoutId++;
    const workout: Workout = { ...insertWorkout, id };
    this.workouts.set(id, workout);
    return workout;
  }
  
  async completeWorkout(id: number): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;
    
    const completedWorkout = { ...workout, completed: true };
    this.workouts.set(id, completedWorkout);
    return completedWorkout;
  }
  
  // Set operations
  async getSetsForWorkout(workoutId: number): Promise<Set[]> {
    return Array.from(this.sets.values())
      .filter((set) => set.workoutId === workoutId)
      .sort((a, b) => a.setOrder - b.setOrder);
  }
  
  async createSet(insertSet: InsertSet): Promise<Set> {
    const id = this.currentSetId++;
    const set: Set = { ...insertSet, id };
    this.sets.set(id, set);
    return set;
  }
  
  async completeSet(id: number): Promise<Set | undefined> {
    const set = this.sets.get(id);
    if (!set) return undefined;
    
    const completedSet = { ...set, completed: true };
    this.sets.set(id, completedSet);
    return completedSet;
  }
  
  // Workout data operations (for JSON storage)
  async getWorkoutData(userId: number): Promise<WorkoutData | undefined> {
    return Array.from(this.workoutData.values()).find(
      (data) => data.userId === userId
    );
  }
  
  async saveWorkoutData(insertWorkoutData: InsertWorkoutData): Promise<WorkoutData> {
    // Check if the user already has workout data
    const existingData = await this.getWorkoutData(insertWorkoutData.userId);
    
    if (existingData) {
      // Update existing data
      const updatedData = { ...existingData, data: insertWorkoutData.data };
      this.workoutData.set(existingData.id, updatedData);
      return updatedData;
    } else {
      // Create new data
      const id = this.currentWorkoutDataId++;
      const workoutData: WorkoutData = { ...insertWorkoutData, id };
      this.workoutData.set(id, workoutData);
      return workoutData;
    }
  }
  
  async updateWorkoutData(userId: number, data: any): Promise<WorkoutData | undefined> {
    const existingData = await this.getWorkoutData(userId);
    if (!existingData) return undefined;
    
    const updatedData = { ...existingData, data };
    this.workoutData.set(existingData.id, updatedData);
    return updatedData;
  }
}

export const storage = new MemStorage();
