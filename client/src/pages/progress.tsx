import { useState } from "react";
import { useWorkout } from "@/context/workout-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProgressChart from "@/components/progress/progress-chart";
import ConsistencyCalendar from "@/components/progress/consistency-calendar";
import { Lift } from "@/types";

export default function ProgressPage() {
  const { lifts, getLiftHistory, getWorkoutDays } = useWorkout();
  const [selectedLift, setSelectedLift] = useState<Lift | null>(lifts[0] || null);
  
  // Get history for the selected lift
  const liftHistory = selectedLift ? getLiftHistory(selectedLift.id) : [];
  
  // Calculate PR (Personal Record)
  const findPR = () => {
    if (!liftHistory.length) return { weight: 0, date: new Date() };
    
    return liftHistory.reduce((max, current) => {
      const maxWeight = Math.max(...current.sets.map(set => set.weight));
      return maxWeight > max.weight ? { weight: maxWeight, date: new Date(current.date) } : max;
    }, { weight: 0, date: new Date() });
  };
  
  const pr = findPR();
  
  // Calculate total volume (last 30 days)
  const calculateTotalVolume = () => {
    if (!liftHistory.length) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return liftHistory
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .reduce((total, record) => {
        return total + record.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight * set.reps);
        }, 0);
      }, 0);
  };
  
  const totalVolume = calculateTotalVolume();
  
  // Get workout consistency data
  const workoutDays = getWorkoutDays();
  
  return (
    <div className="py-4">
      <h2 className="font-pixel text-lg text-secondary mb-6 text-center">YOUR PROGRESS</h2>
      
      {/* Exercise Selection */}
      <div className="mb-6">
        <label className="block font-pixel text-xs text-white mb-2">SELECT EXERCISE</label>
        <Select 
          value={selectedLift?.id} 
          onValueChange={(value) => setSelectedLift(lifts.find(l => l.id === value) || null)}
        >
          <SelectTrigger className="w-full bg-background text-white py-2 px-3 rounded pixel-border pixel-border-secondary">
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            {lifts.map((lift) => (
              <SelectItem key={lift.id} value={lift.id}>
                {lift.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Progress Chart */}
      {selectedLift && (
        <div className="bg-[hsl(var(--card))] p-4 rounded-lg mb-6 pixel-border pixel-border-primary">
          <h3 className="font-pixel text-xs text-white mb-4">WEIGHT PROGRESS (LBS)</h3>
          <ProgressChart liftHistory={liftHistory} />
        </div>
      )}
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[hsl(var(--card))] p-4 rounded-lg pixel-border pixel-border-accent">
          <h3 className="font-pixel text-xs text-accent mb-2">CURRENT PR</h3>
          <p className="font-bold text-2xl text-white">{pr.weight} lbs</p>
          <p className="text-xs text-gray-400">
            {pr.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-[hsl(var(--card))] p-4 rounded-lg pixel-border pixel-border-secondary">
          <h3 className="font-pixel text-xs text-secondary mb-2">TOTAL VOLUME</h3>
          <p className="font-bold text-2xl text-white">{totalVolume.toLocaleString()} lbs</p>
          <p className="text-xs text-gray-400">Last 30 days</p>
        </div>
      </div>
      
      {/* Workout Consistency */}
      <div className="bg-[hsl(var(--card))] p-4 rounded-lg mb-4 pixel-border pixel-border-primary">
        <h3 className="font-pixel text-xs text-white mb-4">WORKOUT CONSISTENCY</h3>
        <ConsistencyCalendar workoutDays={workoutDays} />
      </div>
    </div>
  );
}
