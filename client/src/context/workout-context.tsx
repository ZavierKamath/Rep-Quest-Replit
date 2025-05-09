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
  updateSplit: (splitId: string, updatedSplit: Partial<Split>) => void;
  addDayToSplit: (splitId: string, day: Day) => void;
  updateDay: (splitId: string, dayIndex: number, updatedDay: Partial<Day>) => void;
  deleteDay: (splitId: string, dayIndex: number) => void;
  addLiftToDay: (splitId: string, dayIndex: number, liftId: string, defaultSets?: number, defaultReps?: number) => void;
  removeLiftFromDay: (splitId: string, dayIndex: number, liftId: string) => void;
  updateLiftSettings: (liftId: string, settings: Partial<Lift>) => Lift;
  
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
    console.log(`Activating split with ID: ${splitId}`);
    const splitToActivate = splits.find(s => s.id === splitId);
    console.log("Split to activate:", splitToActivate);
    
    setUserData(prev => {
      const newState = {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          currentSplitId: splitId,
          currentDayIndex: 0, // Reset to first day
          activeWorkoutId: null,
          completedWorkoutIds: []
        }
      };
      console.log("New state after activation:", newState);
      return newState;
    });
  };
  
  // Create a new split
  const createSplit = (split: Split) => {
    setUserData(prev => ({
      ...prev,
      splits: [...prev.splits, split]
    }));
  };
  
  // Update an existing split
  const updateSplit = (splitId: string, updatedSplit: Partial<Split>) => {
    setUserData(prev => {
      const updatedSplits = prev.splits.map(split => {
        if (split.id === splitId) {
          return { ...split, ...updatedSplit };
        }
        return split;
      });
      
      return {
        ...prev,
        splits: updatedSplits
      };
    });
  };
  
  // Add a day to a split
  const addDayToSplit = (splitId: string, day: Day) => {
    setUserData(prev => {
      const updatedSplits = prev.splits.map(split => {
        if (split.id === splitId) {
          return { 
            ...split, 
            days: [...split.days, day] 
          };
        }
        return split;
      });
      
      return {
        ...prev,
        splits: updatedSplits
      };
    });
  };
  
  // Update a day in a split
  const updateDay = (splitId: string, dayIndex: number, updatedDay: Partial<Day>) => {
    setUserData(prev => {
      const updatedSplits = prev.splits.map(split => {
        if (split.id === splitId && dayIndex >= 0 && dayIndex < split.days.length) {
          const updatedDays = [...split.days];
          updatedDays[dayIndex] = { ...updatedDays[dayIndex], ...updatedDay };
          return { ...split, days: updatedDays };
        }
        return split;
      });
      
      return {
        ...prev,
        splits: updatedSplits
      };
    });
  };
  
  // Delete a day from a split
  const deleteDay = (splitId: string, dayIndex: number) => {
    setUserData(prev => {
      const updatedSplits = prev.splits.map(split => {
        if (split.id === splitId && dayIndex >= 0 && dayIndex < split.days.length) {
          const updatedDays = [...split.days];
          updatedDays.splice(dayIndex, 1);
          return { ...split, days: updatedDays };
        }
        return split;
      });
      
      return {
        ...prev,
        splits: updatedSplits
      };
    });
  };
  
  // Add a lift to a day
  const addLiftToDay = (splitId: string, dayIndex: number, liftId: string, defaultSets = 3, defaultReps = 8) => {
    setUserData(prev => {
      const updatedSplits = prev.splits.map(split => {
        if (split.id === splitId && dayIndex >= 0 && dayIndex < split.days.length) {
          const updatedDays = [...split.days];
          updatedDays[dayIndex] = { 
            ...updatedDays[dayIndex], 
            lifts: [...updatedDays[dayIndex].lifts, liftId] 
          };
          return { ...split, days: updatedDays };
        }
        return split;
      });
      
      return {
        ...prev,
        splits: updatedSplits
      };
    });
  };
  
  // Remove a lift from a day
  const removeLiftFromDay = (splitId: string, dayIndex: number, liftId: string) => {
    setUserData(prev => {
      const updatedSplits = prev.splits.map(split => {
        if (split.id === splitId && dayIndex >= 0 && dayIndex < split.days.length) {
          const updatedDays = [...split.days];
          updatedDays[dayIndex] = { 
            ...updatedDays[dayIndex], 
            lifts: updatedDays[dayIndex].lifts.filter(id => id !== liftId) 
          };
          return { ...split, days: updatedDays };
        }
        return split;
      });
      
      return {
        ...prev,
        splits: updatedSplits
      };
    });
  };
  
  // Update lift settings
  const updateLiftSettings = (liftId: string, settings: Partial<Lift>) => {
    let updatedLift: Lift = { id: '', name: '', defaultWeight: 0, weightIncrement: 0 };
    
    setUserData(prev => {
      const updatedLifts = prev.lifts.map(lift => {
        if (lift.id === liftId) {
          updatedLift = { ...lift, ...settings };
          return updatedLift;
        }
        return lift;
      });
      
      return {
        ...prev,
        lifts: updatedLifts
      };
    });
    
    return updatedLift;
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
      updateSplit,
      addDayToSplit,
      updateDay,
      deleteDay,
      addLiftToDay,
      removeLiftFromDay,
      updateLiftSettings,
      
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
