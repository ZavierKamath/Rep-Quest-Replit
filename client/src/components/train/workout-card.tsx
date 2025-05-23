import { useState, useEffect } from "react";
import { useWorkout } from "@/context/workout-context";
import RepCounter from "./rep-counter";
import WeightControls from "./weight-controls";
import { Button } from "@/components/ui/button";
import { Workout, Set } from "@/types";

interface WorkoutCardProps {
  workout: Workout;
  isActive: boolean;
  isCompleted: boolean;
}

export default function WorkoutCard({ workout, isActive, isCompleted }: WorkoutCardProps) {
  const { 
    startWorkout, 
    completeWorkout,
    undoCompleteWorkout, 
    completeSet,
    removeSet,
    addSet, 
    getLastWeight, 
    getSetsForWorkout,
    lifts 
  } = useWorkout();
  
  const [expanded, setExpanded] = useState(isActive);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weight, setWeight] = useState(getLastWeight(workout.liftId) || workout.defaultWeight);
  const [selectedReps, setSelectedReps] = useState<number | null>(null);
  const [totalSets, setTotalSets] = useState(workout.defaultSets);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  
  // Get exercise data
  const sets = getSetsForWorkout(workout.id);
  const isCurrentSet = sets.length === currentSetIndex;
  
  // Find the lift to get default reps
  const lift = lifts.find(l => l.id === workout.liftId);
  const defaultReps = lift?.defaultReps || 8;
  
  // Update current set index when sets change
  useEffect(() => {
    if (!isCompleted && !isEditingMode) {
      // Only update the current set index if we're not in edit mode
      setCurrentSetIndex(sets.length);
    } else if (isEditingMode && sets.length === currentSetIndex) {
      // We're in edit mode and the set has been removed, ready for re-entry
      // Keep the current index and don't update it
    }
  }, [sets.length, isCompleted, isEditingMode, currentSetIndex]);
  
  // Handle weight change
  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
  };
  
  // Handle rep selection
  const handleRepSelect = (reps: number) => {
    setSelectedReps(reps);
  };
  
  // Handle set completion
  const handleCompleteSet = () => {
    if (selectedReps === null) return;
    
    completeSet(workout.id, {
      weight,
      reps: selectedReps,
      completed: true
    });
    
    // Reset for next set
    setSelectedReps(null);
    
    // If we were in editing mode, exit it
    if (isEditingMode) {
      setIsEditingMode(false);
      setEditingSetIndex(null);
    }
    
    // If all sets completed, ask to finish exercise
    if (sets.length + 1 >= totalSets) {
      // Can still add more sets if needed
    }
  };
  
  // Handle adding an extra set
  const handleAddSet = () => {
    setTotalSets(totalSets + 1);
    addSet(workout.id);
  };
  
  // Handle removing a specific set
  const handleRemoveSet = (index: number) => {
    removeSet(workout.id, index);
  };
  
  // Handle completing the entire exercise
  const handleCompleteExercise = () => {
    completeWorkout(workout.id);
    setExpanded(false);
  };
  
  // Handle undoing a completed exercise
  const handleUndoComplete = () => {
    console.log("Undoing completion for workout:", workout.id);
    
    // Call the context function to undo completion
    undoCompleteWorkout(workout.id);
    
    // Update local state
    setExpanded(true);
    
    // Reset the current set index to the number of completed sets
    setCurrentSetIndex(sets.length);
    
    // Visual feedback could be added here if desired
    
    // Make this workout active again
    startWorkout(workout.id);
  };
  
  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore clicks on buttons and inputs
    if (
      e.target instanceof HTMLButtonElement || 
      e.target instanceof HTMLInputElement || 
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('svg') ||  // Ignore SVG icon clicks inside buttons
      (e.target as HTMLElement).tagName.toLowerCase() === 'path' ||  // Ignore SVG path clicks inside buttons
      isActive
    ) {
      return;
    }
    
    if (!isCompleted && !isActive) {
      startWorkout(workout.id);
      setExpanded(true);
    } else {
      setExpanded(!expanded);
    }
  };
  
  // Get icon for exercise
  const getExerciseIcon = () => {
    // Map icons based on exercise type
    const iconMap: Record<string, string> = {
      bench_press: "ri-boxing-line",
      shoulder_press: "ri-basketball-line",
      tricep_pushdown: "ri-hand-coin-line",
      squat: "ri-walk-line",
      deadlift: "ri-hand-coin-line",
      lat_pulldown: "ri-arrow-down-line",
      bicep_curl: "ri-contrast-2-line"
    };
    
    return iconMap[workout.liftId] || "ri-dumbbell-line";
  };
  
  return (
    <div 
      className={`workout-card rounded-lg p-4 pixel-border relative ${
        isActive ? "bg-[hsl(var(--card))] pixel-border-secondary active" : 
        isCompleted ? "bg-success/10 border-success/70" : 
        "bg-[hsl(var(--card))] border-muted"
      } ${!isActive && !isCompleted ? "opacity-60" : ""}`}
      onClick={handleCardClick}
    >
      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-md font-pixel text-success text-base flex items-center justify-center shadow-md border border-success">
            COMPLETED <i className="ri-checkbox-circle-fill ml-1.5"></i>
          </div>
        </div>
      )}
    
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-10 h-10 mr-3 flex items-center justify-center bg-background rounded-md pixel-border ${
            isActive ? "border-secondary" : isCompleted ? "border-success" : "border-muted"
          }`}>
            <i className={`${getExerciseIcon()} text-lg ${
              isActive ? "text-secondary" : isCompleted ? "text-success" : "text-gray-400"
            }`}></i>
          </div>
          <div>
            <h3 className="font-body font-medium text-white">{workout.name}</h3>
            <p className="text-xs text-gray-400">{totalSets} sets × {workout.repRange} reps</p>
          </div>
        </div>
        <div className="flex items-center">
          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                // Stop propagation to prevent the card's click handler from interfering
                e.stopPropagation();
                // Call the undo function directly
                handleUndoComplete();
              }}
              className="text-xs text-white bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-slate-500 flex items-center transition-all duration-200 mr-2 px-3 py-1.5 z-20 relative"
              style={{ zIndex: 50 }} // Ensure the button is on top
              aria-label="Undo Complete Exercise"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Undo Complete
            </Button>
          ) : null}
          <div className={`h-6 w-6 ml-2 bg-background rounded-full flex items-center justify-center pixel-border ${
            isActive ? "border-accent" : isCompleted ? "border-success" : "border-muted"
          }`}>
            {isCompleted ? (
              <i className="ri-check-line text-success text-sm"></i>
            ) : isActive ? (
              <span className="text-accent text-xs font-pixel">GO</span>
            ) : (
              <span className="text-gray-400 text-xs">{sets.length}/{totalSets}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Set Details */}
      {expanded && (
        <div className="mt-4 pl-12">
          <div className="space-y-3">
            {isCompleted ? (
              // Display completed sets
              <div>
                <div className="mb-3">
                  <div className="bg-success/10 p-3 rounded-lg border border-success/30 mb-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full -translate-x-12 -translate-y-12"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-success/10 rounded-full translate-x-8 translate-y-8"></div>
                    
                    <div className="flex items-center justify-between mb-3 relative">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success mr-2">
                          <circle cx="12" cy="8" r="5"></circle>
                          <path d="M20 21a8 8 0 0 0-16 0"></path>
                          <path d="M17 19c-2.8-2.8-7.2-2.8-10 0"></path>
                        </svg>
                        <span className="text-success font-pixel text-sm">EXERCISE COMPLETED!</span>
                      </div>
                      <div className="flex">
                        <i className="ri-medal-line text-success text-lg mr-1"></i>
                        <i className="ri-checkbox-circle-fill text-success text-lg"></i>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Set</span>
                      <span>Weight × Reps</span>
                    </div>
                    
                    {sets.map((set, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between text-sm mb-1.5 py-1 border-b border-success/10 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-success opacity-5 pointer-events-none"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
                        <span className="text-success font-pixel text-xs ml-2">SET {index + 1}</span>
                        <div className="flex items-center">
                          <span className="mr-2 font-body">{set.weight} lbs × {set.reps} reps</span>
                          <i className="ri-checkbox-circle-line text-success"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : isActive ? (
              // Active set input
              <div className="set-input-container space-y-4">
                {/* Display completed sets */}
                {sets.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-12 text-xs text-gray-400 mb-2 px-2">
                      <span className="col-span-2">Set</span>
                      <span className="col-span-5 text-center">Weight × Reps</span>
                      <span className="col-span-5 text-right">Actions</span>
                    </div>
                    {sets.map((set, index) => (
                      <div 
                        key={index} 
                        className="grid grid-cols-12 items-center text-sm mb-1.5 py-1 border-b border-gray-800 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-success opacity-5 pointer-events-none"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
                        
                        {/* Set number - 2 columns */}
                        <span className="text-success font-pixel text-xs ml-2 col-span-2">SET {index + 1} ✓</span>
                        
                        {/* Weight and reps - 5 columns */}
                        <span className="font-body text-center col-span-5">{set.weight} lbs × {set.reps} reps</span>
                        
                        {/* Action buttons - 5 columns */}
                        <div className="flex justify-end col-span-5">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              
                              // Set edit mode
                              setIsEditingMode(true);
                              setEditingSetIndex(index);
                              
                              // Copy the set's info to the form for editing
                              setWeight(set.weight);
                              setSelectedReps(set.reps);
                              
                              // IMPORTANT - Make sure we're in the active workout state
                              if (!isActive) {
                                startWorkout(workout.id);
                              }
                              
                              // Delete the set we're editing
                              removeSet(workout.id, index);
                            }}
                            className="px-2 py-1 h-7 mr-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              <path d="m15 5 4 4"></path>
                            </svg>
                            Edit
                          </Button>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              
                              // IMPORTANT - Make sure we're in the active workout state
                              if (!isActive) {
                                startWorkout(workout.id);
                              }
                              
                              // Use direct removeSet function with the specific index
                              removeSet(workout.id, index); 
                            }}
                            className="px-2 py-1 h-7 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Current set input - show when adding a new set or in edit mode */}
                {!isCompleted && (isEditingMode || currentSetIndex < totalSets) && (
                  <>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-pixel text-xs ${isEditingMode ? "text-amber-500" : "text-secondary"}`}>
                          {isEditingMode 
                            ? `EDITING SET ${editingSetIndex !== null ? editingSetIndex + 1 : ""}` 
                            : `SET ${currentSetIndex + 1}`}
                        </span>
                        
                        {/* Weight Input */}
                        <div className="flex items-center">
                          <WeightControls
                            value={weight}
                            onChange={handleWeightChange}
                            step={workout.weightIncrement || 5}
                          />
                          <span className="ml-2 text-xs text-gray-400">lbs</span>
                        </div>
                      </div>
                      
                      {/* Rep Counter */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-2">Reps completed:</p>
                        <RepCounter 
                          maxReps={20} 
                          value={selectedReps} 
                          onChange={handleRepSelect}
                        />
                      </div>
                      
                      {/* Complete Set Button */}
                      <Button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleCompleteSet();
                          
                          // Show a temporary success message
                          const button = e.currentTarget;
                          const originalText = button.innerHTML;
                          
                          if (isEditingMode) {
                            button.innerHTML = `<i class="ri-check-line mr-1"></i> SET UPDATED!`;
                          } else {
                            button.innerHTML = `<i class="ri-check-line mr-1"></i> SET ${currentSetIndex + 1} LOGGED!`;
                          }
                          
                          button.classList.add("bg-success", "border-success");
                          
                          setTimeout(() => {
                            button.innerHTML = originalText;
                            button.classList.remove("bg-success", "border-success");
                          }, 1000);
                        }}
                        disabled={selectedReps === null}
                        className={`w-full py-2 rounded-md font-pixel text-sm hover:bg-opacity-90 transition-all duration-200 pixel-border ${
                          isEditingMode 
                            ? "bg-amber-500 text-black pixel-border-amber-700" 
                            : "bg-secondary text-dark pixel-border-accent"
                        } disabled:opacity-50`}
                      >
                        {isEditingMode ? `SAVE EDITED SET` : `LOG SET ${currentSetIndex + 1}`}
                      </Button>
                    </div>
                  </>
                )}
                
                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  {currentSetIndex < totalSets ? (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); handleAddSet(); }}
                      className="flex-1 py-2 rounded-md bg-accent text-white font-pixel text-xs hover:bg-opacity-90 transition-all duration-200 pixel-border pixel-border-secondary"
                    >
                      <i className="ri-add-line mr-1"></i> ADD SET
                    </Button>
                  ) : null}
                  
                  {sets.length > 0 && (
                    <Button 
                      onClick={(e) => { e.stopPropagation(); handleCompleteExercise(); }}
                      className="flex-1 py-2 rounded-md bg-primary text-white font-pixel text-xs hover:bg-opacity-90 transition-all duration-200 pixel-border pixel-border-accent"
                    >
                      COMPLETE EXERCISE
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
