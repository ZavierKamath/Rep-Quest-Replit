import { useState, useEffect } from "react";
import { useWorkout } from "@/context/workout-context";
import WorkoutCard from "@/components/train/workout-card";
import { format } from "date-fns";

export default function TrainPage() {
  const { 
    currentSplit,
    currentDay,
    workouts,
    getNextWorkoutDay,
    getPreviousWorkoutDay,
    completedWorkouts,
    activeWorkout
  } = useWorkout();
  
  // Get date formatting
  const currentDate = format(new Date(), "EEEE, MMMM d");
  const nextDay = getNextWorkoutDay();
  const prevDay = getPreviousWorkoutDay();

  // Calculate progress
  const totalWorkouts = workouts.length;
  const completedCount = completedWorkouts.length;
  const progressPercentage = totalWorkouts > 0 ? (completedCount / totalWorkouts) * 100 : 0;

  return (
    <div className="py-4">
      {/* Date Display */}
      <div className="text-center mb-6">
        <p className="text-gray-400 font-body">{currentDate}</p>
        <h2 className="font-pixel text-lg text-secondary my-2">{currentDay?.name.toUpperCase()} DAY</h2>
        <div className="flex justify-center items-center space-x-4 font-pixel text-xs mt-4">
          <span className="text-gray-500">{prevDay?.name.toUpperCase() || "REST"}</span>
          <i className="ri-arrow-right-line text-gray-500"></i>
          <span className="text-secondary">{currentDay?.name.toUpperCase()}</span>
          <i className="ri-arrow-right-line text-gray-500"></i>
          <span className="text-gray-500">{nextDay?.name.toUpperCase() || "REST"}</span>
        </div>
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
      
      {/* Workout List */}
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
    </div>
  );
}
