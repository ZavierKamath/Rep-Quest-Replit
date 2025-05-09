import { useState, useEffect } from "react";
import { useWorkout } from "@/context/workout-context";
import WorkoutCard from "@/components/train/workout-card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrainPage() {
  const { 
    currentSplit,
    currentDay,
    workouts,
    getNextWorkoutDay,
    getPreviousWorkoutDay,
    completedWorkouts,
    activeWorkout,
    completeCurrentDay,
    undoCompleteCurrentDay,
    moveToDay,
    lifts,
    addLiftToDay
  } = useWorkout();
  
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedLift, setSelectedLift] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get date formatting
  const currentDate = format(new Date(), "EEEE, MMMM d");
  const nextDay = getNextWorkoutDay();
  const prevDay = getPreviousWorkoutDay();

  // Calculate progress
  const totalWorkouts = workouts.length;
  const completedCount = completedWorkouts.length;
  const progressPercentage = totalWorkouts > 0 ? (completedCount / totalWorkouts) * 100 : 0;
  
  // Check if all workouts are completed
  const allCompleted = totalWorkouts > 0 && completedCount === totalWorkouts;
  
  // Handle day submission and moving to next day
  const handleFinishDay = () => {
    setIsSubmitting(true);
    
    // Save any data and move to next day
    completeCurrentDay();
    
    // Reset state
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };
  
  // Handle adding a new exercise to the day
  const handleAddExercise = () => {
    if (!selectedLift || !currentSplit || currentDay === null) return;
    
    // Get current day index
    const dayIndex = currentSplit.days.findIndex(d => d.name === currentDay.name);
    if (dayIndex === -1) return;
    
    // Add lift to the day
    addLiftToDay(currentSplit.id, dayIndex, selectedLift);
    
    // Close dialog
    setShowAddExercise(false);
    setSelectedLift("");
  };
  
  // Get available lifts (not already in the day)
  const availableLifts = lifts.filter(lift => {
    return !currentDay?.lifts.includes(lift.id);
  });

  return (
    <div className="py-4 pb-32">
      {/* Date Display */}
      <div className="text-center mb-6">
        <p className="text-gray-400 font-body">{currentDate}</p>
        <h2 className="font-pixel text-lg text-secondary my-2">{currentDay?.name.toUpperCase() || "REST"} DAY</h2>
        
        {/* Split Day Navigation */}
        {currentSplit && (
          <div className="flex justify-center items-center space-x-4 font-pixel text-xs mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-white"
              onClick={() => {
                const dayIndex = currentSplit.days.findIndex(day => day.name === prevDay?.name);
                if (dayIndex >= 0) moveToDay(dayIndex);
              }}
            >
              <i className="ri-arrow-left-line mr-1"></i>
              {prevDay?.name.toUpperCase() || "REST"}
            </Button>
            
            <span className="text-secondary px-4 border-l border-r border-gray-800">{currentDay?.name.toUpperCase()}</span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-white"
              onClick={() => {
                const dayIndex = currentSplit.days.findIndex(day => day.name === nextDay?.name);
                if (dayIndex >= 0) moveToDay(dayIndex);
              }}
            >
              {nextDay?.name.toUpperCase() || "REST"}
              <i className="ri-arrow-right-line ml-1"></i>
            </Button>
          </div>
        )}
      </div>
      
      {/* Workout Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-pixel text-xs text-white">WORKOUT PROGRESS</span>
          <span className="font-pixel text-xs text-secondary">{completedCount}/{totalWorkouts}</span>
        </div>
        <div className="pixel-progress">
          <div className="pixel-progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      
      {/* Add Exercise Button */}
      <div className="mb-4 flex justify-end">
        <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs border-accent text-accent"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary">
            <DialogHeader>
              <DialogTitle className="font-pixel text-primary">ADD EXERCISE</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-xs mb-2">Select Exercise</label>
                <Select 
                  value={selectedLift} 
                  onValueChange={setSelectedLift}
                >
                  <SelectTrigger className="bg-background text-white">
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-white">
                    {availableLifts.map(lift => (
                      <SelectItem key={lift.id} value={lift.id}>
                        {lift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-accent text-white"
                  onClick={handleAddExercise}
                  disabled={!selectedLift}
                >
                  Add to Workout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Workout List */}
      {workouts.length > 0 ? (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <WorkoutCard 
              key={workout.id} 
              workout={workout}
              isActive={activeWorkout?.id === workout.id}
              isCompleted={completedWorkouts.includes(workout.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-muted">
          <p className="text-gray-400 mb-2">No exercises added yet</p>
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs border-accent text-accent"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Exercise
          </Button>
        </div>
      )}
      
      {/* Submit Day Button */}
      {workouts.length > 0 && (
        <div className="fixed bottom-[60px] left-0 right-0 bg-background border-t border-gray-800 p-4 flex justify-center">
          <div className="container max-w-md">
            <div className="flex space-x-3">
              {completedCount > 0 && (
                <Button 
                  variant="outline"
                  className="flex-1 py-2 text-sm font-pixel border-secondary text-secondary"
                  onClick={undoCompleteCurrentDay}
                >
                  <i className="ri-restart-line mr-1"></i> RESET DAY
                </Button>
              )}
              
              <Button 
                className={`flex-1 py-2 text-sm font-pixel text-white ${allCompleted ? 'bg-success' : 'bg-primary'} pixel-border ${allCompleted ? 'pixel-border-success' : 'pixel-border-accent'}`}
                onClick={handleFinishDay}
                disabled={completedCount === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <i className="ri-loader-4-line animate-spin mr-1"></i> SUBMITTING...
                  </span>
                ) : allCompleted ? (
                  <span className="flex items-center">
                    <i className="ri-check-double-line mr-1"></i> FINISH DAY
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="ri-arrow-right-line mr-1"></i> SUBMIT ({completedCount}/{totalWorkouts})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
