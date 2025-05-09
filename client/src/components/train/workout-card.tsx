import { useState } from "react";
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
    completeSet, 
    getLastWeight, 
    getSetsForWorkout 
  } = useWorkout();
  
  const [expanded, setExpanded] = useState(isActive);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weight, setWeight] = useState(getLastWeight(workout.liftId) || workout.defaultWeight);
  const [selectedReps, setSelectedReps] = useState<number | null>(null);
  
  // Get exercise data
  const sets = getSetsForWorkout(workout.id);
  const totalSets = workout.defaultSets;
  const isCurrentSet = sets.length === currentSetIndex;
  
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
    
    // Move to next set or complete workout
    if (currentSetIndex + 1 < totalSets) {
      setCurrentSetIndex(currentSetIndex + 1);
      setSelectedReps(null);
    } else {
      completeWorkout(workout.id);
    }
  };
  
  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    // Ignore clicks on buttons and inputs
    if (
      e.target instanceof HTMLButtonElement || 
      e.target instanceof HTMLInputElement || 
      (e.target as HTMLElement).closest('button') ||
      isActive
    ) {
      return;
    }
    
    if (!isCompleted && !isActive) {
      startWorkout(workout.id);
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
      className={`workout-card bg-[hsl(var(--card))] rounded-lg p-4 pixel-border ${
        isActive ? "pixel-border-secondary active" : isCompleted ? "border-success" : "border-muted"
      } ${!isActive && !isCompleted ? "opacity-60" : ""}`}
      onClick={handleCardClick}
    >
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
            <p className="text-xs text-gray-400">{workout.defaultSets} sets × {workout.repRange} reps</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`h-6 w-6 bg-background rounded-full flex items-center justify-center pixel-border ${
            isActive ? "border-accent" : isCompleted ? "border-success" : "border-muted"
          }`}>
            {isCompleted ? (
              <i className="ri-check-line text-success text-sm"></i>
            ) : isActive ? (
              <span className="text-accent text-xs font-pixel">GO</span>
            ) : (
              <span className="text-gray-400 text-xs">{workout.defaultSets}</span>
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
              sets.map((set, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-secondary font-pixel text-xs">SET {index + 1}</span>
                  <div className="flex items-center">
                    <span className="mr-2 font-body">{set.weight} lbs × {set.reps} reps</span>
                    <i className="ri-checkbox-circle-line text-success"></i>
                  </div>
                </div>
              ))
            ) : isActive ? (
              // Active set input
              <div className="set-input-container space-y-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-secondary font-pixel text-xs">SET {currentSetIndex + 1}</span>
                  
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
                    maxReps={12} 
                    value={selectedReps} 
                    onChange={handleRepSelect}
                  />
                </div>
                
                {/* Complete Set Button */}
                <Button 
                  onClick={handleCompleteSet}
                  disabled={selectedReps === null}
                  className="w-full py-2 rounded-md bg-secondary text-dark font-pixel text-sm hover:bg-opacity-90 transition-all duration-200 pixel-border pixel-border-accent disabled:opacity-50"
                >
                  COMPLETE SET
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
