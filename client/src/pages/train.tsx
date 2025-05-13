import { useState, useEffect } from "react";
import { useWorkout } from "@/context/workout-context";
import WorkoutCard from "@/components/train/workout-card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, RefreshCcw, Bug } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLifts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  
  const { toast } = useToast();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedLift, setSelectedLift] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
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
  
  // Force refresh lifts from API
  const handleRefreshLifts = async () => {
    setIsRefreshing(true);
    try {
      console.log("client/src/pages/train.tsx: Manually refreshing lifts from API");
      
      // Get current data from localStorage
      const savedData = localStorage.getItem("repQuestData");
      if (savedData) {
        // Parse the data
        const data = JSON.parse(savedData);
        
        // Import default lifts to make sure we preserve them
        const { defaultLifts } = await import('@/lib/workout-data');
        
        // We need to preserve splits and workout data 
        // but refresh the lifts with the defaults as a base
        // This ensures that existing workout plans aren't affected
        
        // Set lifts back to default lifts to ensure they're always available
        data.lifts = [...defaultLifts]; // Start with default lifts
        
        // Reset lift history to avoid orphaned history entries
        // But preserve default lift history
        const updatedLiftHistory: Record<string, any[]> = {};
        defaultLifts.forEach(lift => {
          // Initialize history for default lifts
          if (data.liftHistory && typeof data.liftHistory === 'object') {
            updatedLiftHistory[lift.id] = (data.liftHistory[lift.id] || []);
          } else {
            updatedLiftHistory[lift.id] = [];
          }
        });
        data.liftHistory = updatedLiftHistory;
        
        // Save back to localStorage
        localStorage.setItem("repQuestData", JSON.stringify(data));
      }
      
      // Show toast notification
      toast({
        title: "Refreshing lifts",
        description: "Reloading available exercises from the server",
      });
      
      // Reload page to refresh context
      window.location.reload();
    } catch (error) {
      console.error("client/src/pages/train.tsx: Error refreshing lifts:", error);
      toast({
        title: "Error refreshing lifts",
        description: "Unable to refresh exercises from the server",
        variant: "destructive",
      });
      setIsRefreshing(false);
    }
  };
  
  // Debug function to show all lifts
  const handleDebugLifts = () => {
    // Show detailed lift information
    console.log("Available lifts in current context:", lifts);
    
    // Check localStorage state
    const savedData = localStorage.getItem("repQuestData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log("Lifts from localStorage:", data.lifts);
      } catch (e) {
        console.error("Failed to parse localStorage data:", e);
      }
    }
    
    // Toggle debug display
    setShowDebug(!showDebug);
    
    // Show toast with counts
    toast({
      title: "Debug Info",
      description: `Total lifts: ${lifts.length}, Available now: ${availableLifts.length}`,
    });
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
      <div className="mb-4 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-gray-700 text-gray-400"
          onClick={handleDebugLifts}
        >
          <Bug className="h-3 w-3 mr-1" />
          Debug
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs border-primary text-primary"
          onClick={handleRefreshLifts}
          disabled={isRefreshing}
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          {isRefreshing ? "Refreshing..." : "Refresh Exercises"}
        </Button>
        
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
      
      {/* Debug Display */}
      {showDebug && (
        <div className="mb-4 p-3 bg-black/50 border border-gray-700 rounded overflow-auto max-h-[300px]">
          <h4 className="font-mono text-xs text-primary mb-2">Debug: Available Lifts</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-1">ID</th>
                <th className="text-left p-1">Name</th>
                <th className="text-left p-1">Weight</th>
              </tr>
            </thead>
            <tbody>
              {availableLifts.map(lift => (
                <tr key={lift.id} className="border-b border-gray-800">
                  <td className="p-1 font-mono text-gray-400">{lift.id}</td>
                  <td className="p-1">{lift.name}</td>
                  <td className="p-1">{lift.defaultWeight}lb</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
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
