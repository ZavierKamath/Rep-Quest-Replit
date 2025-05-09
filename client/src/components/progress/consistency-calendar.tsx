import React from "react";

interface ConsistencyCalendarProps {
  workoutDays: string[]; // Array of date strings (YYYY-MM-DD)
}

export default function ConsistencyCalendar({ workoutDays }: ConsistencyCalendarProps) {
  // Generate calendar grid for the last 2 weeks
  const generateCalendarGrid = () => {
    const today = new Date();
    const days = [];
    
    // Generate days of the week
    const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
    
    // Generate the last 2 weeks of dates (14 days)
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const isWorkoutDay = workoutDays.includes(dateString);
      
      days.push({
        date: dateString,
        isWorkoutDay
      });
    }
    
    return { daysOfWeek, days };
  };
  
  const { daysOfWeek, days } = generateCalendarGrid();
  
  return (
    <>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day headers */}
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-xs text-gray-500">{day}</div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`w-8 h-8 mx-auto rounded-sm ${
              day.isWorkoutDay 
                ? "bg-primary" 
                : "bg-background border-2 border-primary"
            } flex items-center justify-center`}
          >
            <span className={`text-xs ${day.isWorkoutDay ? "text-dark" : ""}`}></span>
          </div>
        ))}
      </div>
      
      {/* Calendar Legend */}
      <div className="flex justify-between mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary mr-1"></div>
          <span className="text-gray-300">Workout Day</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-background border border-primary mr-1"></div>
          <span className="text-gray-300">Rest Day</span>
        </div>
      </div>
    </>
  );
}
