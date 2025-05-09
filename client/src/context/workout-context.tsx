import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  UserData, 
  Split, 
  Workout, 
  Set, 
  Lift, 
  Day,
  LiftHistoryRecord,
  LiftHistory
} from "@/types";
import { 
  defaultLifts, 
  defaultSplits, 
  generateWorkoutsFromSplit,
  createEmptyLiftHistory
} from "@/lib/workout-data";

interface WorkoutContextProps {
  // Data
  lifts: Lift[];
  splits: Split[];
  currentSplit: Split | null;
  currentDay: Day | null;
  workouts: Workout[];
  activeWorkout: Workout | null;
  completedWorkouts: string[];
  
  // Actions
  startWorkout: (workoutId: string) => void;
  completeWorkout: (workoutId: string) => void;
  completeSet: (workoutId: string, set: Set) => void;
  setActiveSplit: (splitId: string) => void;
  createSplit: (split: Split) => void;
  
  // Getters
  getLastWeight: (liftId: string) => number;
  getSetsForWorkout: (workoutId: string) => Set[];
  getLiftHistory: (liftId: string) => LiftHistoryRecord[];
  getWorkoutDays: () => string[];
  getNextWorkoutDay: () => Day | null;
  getPreviousWorkoutDay: () => Day | null;
}

const WorkoutContext = createContext<WorkoutContextProps | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User data state
  const [userData, setUserData] = useState<UserData>(() => {
    // Try to load from localStorage
    const savedData = localStorage.getItem("repQuestData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    
    // Default state
    return {
      lifts: defaultLifts,
      splits: defaultSplits,
      liftHistory: createEmptyLiftHistory(),
      workoutState: {
        currentSplitId: "push_pull_legs",
        currentDayIndex: 0, // Start with Push day
        activeWorkoutId: null,
        completedWorkoutIds: [],
        workoutSets: {},
        lastWeights: {},
        workoutDays: []
      }
    };
  });
  
  // Extract state parts for convenience
  const { 
    lifts, 
    splits, 
    liftHistory, 
    workoutState 
  } = userData;
  
  // Calculate current split and day
  const currentSplit = splits.find(s => s.id === workoutState.currentSplitId) || null;
  const currentDay = currentSplit?.days[workoutState.currentDayIndex] || null;
  
  // Generate workouts for the current day
  const workouts = currentSplit && currentDay 
    ? generateWorkoutsFromSplit(currentSplit, workoutState.currentDayIndex, lifts)
    : [];
  
  // Get active workout
  const activeWorkout = workoutState.activeWorkoutId 
    ? workouts.find(w => w.id === workoutState.activeWorkoutId) || null
    : null;
  
  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("repQuestData", JSON.stringify(userData));
  }, [userData]);
  
  // Start a workout
  const startWorkout = (workoutId: string) => {
    setUserData(prev => ({
      ...prev,
      workoutState: {
        ...prev.workoutState,
        activeWorkoutId: workoutId
      }
    }));
  };
  
  // Complete a workout
  const completeWorkout = (workoutId: string) => {
    // Find the workout and associated lift
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    // Create a new workout history entry
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sets = [...(workoutState.workoutSets[workoutId] || [])];
    
    // Add to lift history
    setUserData(prev => {
      const updatedLiftHistory = { ...prev.liftHistory };
      const liftRecords = [...(updatedLiftHistory[workout.liftId] || [])];
      
      liftRecords.push({
        date: today,
        sets: sets
      });
      
      updatedLiftHistory[workout.liftId] = liftRecords;
      
      // Add today to workout days if not already included
      const updatedWorkoutDays = prev.workoutState.workoutDays.includes(today) 
        ? [...prev.workoutState.workoutDays] 
        : [...prev.workoutState.workoutDays, today];
      
      // Update last weight
      const lastWeight = sets.length > 0 ? sets[sets.length - 1].weight : workout.defaultWeight;
      const updatedLastWeights = { 
        ...prev.workoutState.lastWeights, 
        [workout.liftId]: lastWeight 
      };
      
      return {
        ...prev,
        liftHistory: updatedLiftHistory,
        workoutState: {
          ...prev.workoutState,
          activeWorkoutId: null,
          completedWorkoutIds: [...prev.workoutState.completedWorkoutIds, workoutId],
          lastWeights: updatedLastWeights,
          workoutDays: updatedWorkoutDays
        }
      };
    });
  };
  
  // Complete a set
  const completeSet = (workoutId: string, set: Set) => {
    setUserData(prev => {
      const existingSets = prev.workoutState.workoutSets[workoutId] || [];
      const updatedSets = [...existingSets, set];
      
      return {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          workoutSets: {
            ...prev.workoutState.workoutSets,
            [workoutId]: updatedSets
          }
        }
      };
    });
  };
  
  // Set active split
  const setActiveSplit = (splitId: string) => {
    setUserData(prev => ({
      ...prev,
      workoutState: {
        ...prev.workoutState,
        currentSplitId: splitId,
        currentDayIndex: 0, // Reset to first day
        activeWorkoutId: null,
        completedWorkoutIds: []
      }
    }));
  };
  
  // Create a new split
  const createSplit = (split: Split) => {
    setUserData(prev => ({
      ...prev,
      splits: [...prev.splits, split]
    }));
  };
  
  // Get last weight used for a lift
  const getLastWeight = (liftId: string): number => {
    const lastWeight = workoutState.lastWeights[liftId];
    if (lastWeight) return lastWeight;
    
    // Fallback to default weight
    const lift = lifts.find(l => l.id === liftId);
    return lift ? lift.defaultWeight : 0;
  };
  
  // Get sets for a workout
  const getSetsForWorkout = (workoutId: string): Set[] => {
    return workoutState.workoutSets[workoutId] || [];
  };
  
  // Get lift history
  const getLiftHistory = (liftId: string): LiftHistoryRecord[] => {
    return liftHistory[liftId] || [];
  };
  
  // Get workout days
  const getWorkoutDays = (): string[] => {
    return workoutState.workoutDays;
  };
  
  // Get next workout day
  const getNextWorkoutDay = (): Day | null => {
    if (!currentSplit) return null;
    
    const nextDayIndex = (workoutState.currentDayIndex + 1) % currentSplit.days.length;
    return currentSplit.days[nextDayIndex];
  };
  
  // Get previous workout day
  const getPreviousWorkoutDay = (): Day | null => {
    if (!currentSplit) return null;
    
    const daysLength = currentSplit.days.length;
    const prevDayIndex = (workoutState.currentDayIndex - 1 + daysLength) % daysLength;
    return currentSplit.days[prevDayIndex];
  };
  
  return (
    <WorkoutContext.Provider value={{
      // Data
      lifts,
      splits,
      currentSplit,
      currentDay,
      workouts,
      activeWorkout,
      completedWorkouts: workoutState.completedWorkoutIds,
      
      // Actions
      startWorkout,
      completeWorkout,
      completeSet,
      setActiveSplit,
      createSplit,
      
      // Getters
      getLastWeight,
      getSetsForWorkout,
      getLiftHistory,
      getWorkoutDays,
      getNextWorkoutDay,
      getPreviousWorkoutDay
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
