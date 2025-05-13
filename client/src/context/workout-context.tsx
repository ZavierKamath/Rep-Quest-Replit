import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  UserData, 
  Split, 
  Workout, 
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
import { getLifts } from "@/lib/api";

// Define Set type locally to avoid import issues
interface Set {
  weight: number;
  reps: number;
  completed: boolean;
}

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
  undoCompleteWorkout: (workoutId: string) => void;
  completeSet: (workoutId: string, set: Set) => void;
  removeSet: (workoutId: string, setIndex: number) => void;
  addSet: (workoutId: string) => void;
  setActiveSplit: (splitId: string) => void;
  createSplit: (split: Split) => void;
  updateSplit: (splitId: string, updatedSplit: Partial<Split>) => void;
  addDayToSplit: (splitId: string, day: Day) => void;
  updateDay: (splitId: string, dayIndex: number, updatedDay: Partial<Day>) => void;
  deleteDay: (splitId: string, dayIndex: number) => void;
  addLiftToDay: (splitId: string, dayIndex: number, liftId: string, defaultSets?: number, defaultReps?: number) => void;
  removeLiftFromDay: (splitId: string, dayIndex: number, liftId: string) => void;
  updateLiftSettings: (liftId: string, settings: Partial<Lift>) => Lift;
  completeCurrentDay: () => void;
  undoCompleteCurrentDay: () => void;
  advanceToNextDay: () => void;
  moveToDay: (dayIndex: number) => void;
  
  // Getters
  getLastWeight: (liftId: string) => number;
  getSetsForWorkout: (workoutId: string) => Set[];
  getLiftHistory: (liftId: string) => LiftHistoryRecord[];
  getWorkoutDays: () => string[];
  getNextWorkoutDay: () => Day | null;
  getPreviousWorkoutDay: () => Day | null;
  getDayStatus: (splitId: string, dayIndex: number) => 'pending' | 'active' | 'completed';
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
  
  // Fetch lifts from API and update when component mounts
  useEffect(() => {
    const fetchLiftsFromAPI = async () => {
      try {
        console.log("client/src/context/workout-context.tsx: Fetching lifts from API");
        const apiLifts = await getLifts();
        
        if (apiLifts && apiLifts.length > 0) {
          console.log(`client/src/context/workout-context.tsx: Found ${apiLifts.length} lifts in API response`);
          
          // Convert API lifts to client lift format - IMPORTANT: Always use string IDs
          const formattedApiLifts = apiLifts.map(apiLift => {
            // Try to find a matching default lift ID for better consistency
            const matchingDefaultLift = defaultLifts.find(
              dl => dl.name.toLowerCase() === apiLift.name.toLowerCase()
            );
            
            return {
              // If we find a matching default lift, use its ID for consistency
              id: matchingDefaultLift?.id || 
                  // Otherwise transform numeric ID to string or generate new ID
                  (typeof apiLift.id === 'number' ? `api_lift_${apiLift.id}` : 
                  `api_lift_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
              name: apiLift.name,
              defaultWeight: apiLift.defaultWeight || 0,
              weightIncrement: apiLift.weightIncrement || 5,
              icon: matchingDefaultLift?.icon || getIconForLift(apiLift.name)
            };
          });
          
          // IMPORTANT: Always start with all default lifts to ensure they're available
          const combinedLifts = [...defaultLifts];
          
          // Create a map of existing lift names for quick lookup
          const existingLiftNames = new Map(combinedLifts.map(l => [l.name.toLowerCase(), l]));
          
          // Add API lifts that don't exist in defaults
          formattedApiLifts.forEach(apiLift => {
            if (!existingLiftNames.has(apiLift.name.toLowerCase())) {
              combinedLifts.push(apiLift);
              existingLiftNames.set(apiLift.name.toLowerCase(), apiLift);
            }
          });
          
          console.log(`client/src/context/workout-context.tsx: Using ${combinedLifts.length} total lifts`);
          
          // Update user data with all lifts
          setUserData(prev => {
            // Create lift history entries for any missing lifts
            const updatedLiftHistory = { ...prev.liftHistory };
            combinedLifts.forEach(lift => {
              if (!updatedLiftHistory[lift.id]) {
                updatedLiftHistory[lift.id] = [];
              }
            });
            
            return {
              ...prev,
              lifts: combinedLifts,
              liftHistory: updatedLiftHistory
            };
          });
        } else {
          // If no API lifts found, ensure we at least have all default lifts
          console.log(`client/src/context/workout-context.tsx: No API lifts found, using default lifts`);
          
          setUserData(prev => {
            // Check if we already have all default lifts
            const existingLiftIds = new Set(prev.lifts.map(l => l.id));
            const missingDefaultLifts = defaultLifts.filter(dl => !existingLiftIds.has(dl.id));
            
            if (missingDefaultLifts.length === 0) {
              console.log(`client/src/context/workout-context.tsx: All default lifts already present`);
              return prev; // No change needed
            }
            
            console.log(`client/src/context/workout-context.tsx: Adding ${missingDefaultLifts.length} missing default lifts`);
            
            // Update lift history for any new default lifts
            const updatedLiftHistory = { ...prev.liftHistory };
            missingDefaultLifts.forEach(lift => {
              if (!updatedLiftHistory[lift.id]) {
                updatedLiftHistory[lift.id] = [];
              }
            });
            
            return {
              ...prev,
              lifts: [...prev.lifts, ...missingDefaultLifts],
              liftHistory: updatedLiftHistory
            };
          });
        }
      } catch (error) {
        console.error("client/src/context/workout-context.tsx: Error fetching lifts:", error);
        
        // If API fetch fails, ensure we at least have default lifts available
        setUserData(prev => {
          const currentLiftIds = new Set(prev.lifts.map(lift => lift.id));
          const missingDefaultLifts = defaultLifts.filter(lift => !currentLiftIds.has(lift.id));
          
          if (missingDefaultLifts.length === 0) {
            return prev; // No change needed
          }
          
          console.log(`client/src/context/workout-context.tsx: Adding ${missingDefaultLifts.length} missing default lifts after API error`);
          
          // Update lift history for any new default lifts
          const updatedLiftHistory = { ...prev.liftHistory };
          missingDefaultLifts.forEach(lift => {
            if (!updatedLiftHistory[lift.id]) {
              updatedLiftHistory[lift.id] = [];
            }
          });
          
          return {
            ...prev,
            lifts: [...prev.lifts, ...missingDefaultLifts],
            liftHistory: updatedLiftHistory
          };
        });
      }
    };
    
    fetchLiftsFromAPI();
  }, []);
  
  // Helper function to get an icon for a lift based on its name
  const getIconForLift = (liftName: string): string => {
    const liftNameLower = liftName.toLowerCase();
    
    if (liftNameLower.includes('bench') || liftNameLower.includes('chest') || liftNameLower.includes('push')) {
      return 'ri-boxing-line';
    } else if (liftNameLower.includes('shoulder') || liftNameLower.includes('press')) {
      return 'ri-basketball-line';
    } else if (liftNameLower.includes('tricep')) {
      return 'ri-hand-coin-line';
    } else if (liftNameLower.includes('lateral')) {
      return 'ri-arrow-left-right-line';
    } else if (liftNameLower.includes('delt') || liftNameLower.includes('rear')) {
      return 'ri-refresh-line';
    } else if (liftNameLower.includes('curl') || liftNameLower.includes('bicep')) {
      return 'ri-contrast-2-line';
    } else if (liftNameLower.includes('pull')) {
      return 'ri-arrow-up-line';
    } else if (liftNameLower.includes('row')) {
      return 'ri-arrow-right-line';
    } else if (liftNameLower.includes('down')) {
      return 'ri-arrow-down-line';
    } else if (liftNameLower.includes('leg') || liftNameLower.includes('squat') || liftNameLower.includes('deadlift')) {
      return 'ri-walk-line';
    } else if (liftNameLower.includes('calf')) {
      return 'ri-footprint-line';
    } else if (liftNameLower.includes('trap') || liftNameLower.includes('shrug')) {
      return 'ri-arrow-up-line';
    }
    
    // Default icon
    return 'ri-dumbbell-line';
  };
  
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
  
  // Undo a completed workout
  const undoCompleteWorkout = (workoutId: string) => {
    setUserData(prev => ({
      ...prev,
      workoutState: {
        ...prev.workoutState,
        completedWorkoutIds: prev.workoutState.completedWorkoutIds.filter(id => id !== workoutId)
      }
    }));
  };
  
  // Remove a specific set from a workout
  const removeSet = (workoutId: string, setIndex: number) => {
    setUserData(prev => {
      const existingSets = [...(prev.workoutState.workoutSets[workoutId] || [])];
      if (setIndex >= 0 && setIndex < existingSets.length) {
        existingSets.splice(setIndex, 1);
      }
      
      return {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          workoutSets: {
            ...prev.workoutState.workoutSets,
            [workoutId]: existingSets
          }
        }
      };
    });
  };
  
  // Add an additional set to a workout
  const addSet = (workoutId: string) => {
    // Just a placeholder - actual set will be added when completed
    setUserData(prev => {
      // No need to modify state here, just making the function available
      return prev;
    });
  };
  
  // Complete the current day's workout
  const completeCurrentDay = () => {
    // First, save the current workout data to history
    // This assumes all workouts for the day are completed
    const today = new Date().toISOString().split('T')[0];
    
    setUserData(prev => {
      // Add today to workout days if not already included
      const updatedWorkoutDays = prev.workoutState.workoutDays.includes(today) 
        ? [...prev.workoutState.workoutDays] 
        : [...prev.workoutState.workoutDays, today];
        
      return {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          activeWorkoutId: null,
          completedWorkoutIds: [],
          workoutDays: updatedWorkoutDays
        }
      };
    });
    
    // Then move to the next day
    advanceToNextDay();
  };
  
  // Undo the most recent completed day
  const undoCompleteCurrentDay = () => {
    // Reset all workouts for the current day
    if (!currentSplit || !currentDay) return;
    
    setUserData(prev => {
      // Get the workout IDs for the current day
      const currentDayWorkouts = workouts.map(w => w.id);
      
      // Create a copy of the workout sets with the current day's sets removed
      const updatedWorkoutSets = { ...prev.workoutState.workoutSets };
      currentDayWorkouts.forEach(workoutId => {
        delete updatedWorkoutSets[workoutId];
      });
      
      return {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          activeWorkoutId: null,
          completedWorkoutIds: [],
          workoutSets: updatedWorkoutSets
        }
      };
    });
  };
  
  // Advance to the next day in the split
  const advanceToNextDay = () => {
    if (!currentSplit) return;
    
    const nextDayIndex = (workoutState.currentDayIndex + 1) % currentSplit.days.length;
    
    // Check if we're looping back to the beginning of the split
    const isLoopingBack = nextDayIndex === 0;
    
    setUserData(prev => {
      // Get the next day's workouts to reset their data
      const nextDayWorkouts = isLoopingBack 
        ? generateWorkoutsFromSplit(currentSplit, 0, lifts)
        : generateWorkoutsFromSplit(currentSplit, nextDayIndex, lifts);
      
      // Create a new workoutSets object without the next day's workout data
      const updatedWorkoutSets = { ...prev.workoutState.workoutSets };
      
      // Remove any existing sets for the workouts in the next day
      nextDayWorkouts.forEach(workout => {
        delete updatedWorkoutSets[workout.id];
      });
      
      return {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          currentDayIndex: nextDayIndex,
          activeWorkoutId: null,
          completedWorkoutIds: [],
          workoutSets: updatedWorkoutSets
        }
      };
    });
    
    console.log(`Advanced to day ${nextDayIndex + 1} of split ${currentSplit.name}`);
  };
  
  // Move to a specific day in the split
  const moveToDay = (dayIndex: number) => {
    if (!currentSplit || dayIndex < 0 || dayIndex >= currentSplit.days.length) return;
    
    setUserData(prev => {
      // Get the target day's workouts to reset their data
      const targetDayWorkouts = generateWorkoutsFromSplit(currentSplit, dayIndex, lifts);
      
      // Create a new workoutSets object without the target day's workout data
      const updatedWorkoutSets = { ...prev.workoutState.workoutSets };
      
      // Remove any existing sets for the workouts in the target day
      targetDayWorkouts.forEach(workout => {
        delete updatedWorkoutSets[workout.id];
      });
      
      return {
        ...prev,
        workoutState: {
          ...prev.workoutState,
          currentDayIndex: dayIndex,
          activeWorkoutId: null,
          completedWorkoutIds: [],
          workoutSets: updatedWorkoutSets
        }
      };
    });
    
    console.log(`Moved to day ${dayIndex + 1} of split ${currentSplit.name}`);
  };
  
  // Get day status (pending, active, completed)
  const getDayStatus = (splitId: string, dayIndex: number): 'pending' | 'active' | 'completed' => {
    if (workoutState.currentSplitId !== splitId) return 'pending';
    if (workoutState.currentDayIndex === dayIndex) return 'active';
    
    // Check if we have any history for this day
    const split = splits.find(s => s.id === splitId);
    if (!split || !split.days[dayIndex]) return 'pending';
    
    // Check if workouts for this day are in workout history
    // This is a simplified check - a more robust implementation would track completed days
    const today = new Date().toISOString().split('T')[0];
    if (workoutState.workoutDays.includes(today)) return 'completed';
    
    return 'pending';
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
      undoCompleteWorkout,
      completeSet,
      removeSet,
      addSet,
      setActiveSplit,
      createSplit,
      updateSplit,
      addDayToSplit,
      updateDay,
      deleteDay,
      addLiftToDay,
      removeLiftFromDay,
      updateLiftSettings,
      completeCurrentDay,
      undoCompleteCurrentDay,
      advanceToNextDay,
      moveToDay,
      
      // Getters
      getLastWeight,
      getSetsForWorkout,
      getLiftHistory,
      getWorkoutDays,
      getNextWorkoutDay,
      getPreviousWorkoutDay,
      getDayStatus
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
