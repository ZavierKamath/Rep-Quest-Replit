import { useState, useEffect } from "react";
import { useWorkout } from "@/context/workout-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lift, Day } from "@/types";
import LiftSettings from "./lift-settings";

interface DayEditorProps {
  splitId: string;
  day: Day | null;
  dayIndex: number;
  onSave: () => void;
  onCancel: () => void;
}

export default function DayEditor({ splitId, day, dayIndex, onSave, onCancel }: DayEditorProps) {
  const { lifts, addDayToSplit, updateDay, addLiftToDay, removeLiftFromDay } = useWorkout();
  
  const [dayName, setDayName] = useState(day?.name || "");
  const [selectedLifts, setSelectedLifts] = useState<string[]>(day?.lifts || []);
  const [selectedLiftId, setSelectedLiftId] = useState<string>("");
  
  // Reset form when day changes
  useEffect(() => {
    setDayName(day?.name || "");
    setSelectedLifts(day?.lifts || []);
  }, [day]);
  
  // Filter out lifts that are already added
  const availableLifts = lifts.filter(lift => !selectedLifts.includes(lift.id));
  
  // Handle adding a lift to the day
  const handleAddLift = () => {
    if (selectedLiftId && !selectedLifts.includes(selectedLiftId)) {
      if (day) {
        // For existing day
        addLiftToDay(splitId, dayIndex, selectedLiftId);
        setSelectedLifts([...selectedLifts, selectedLiftId]);
      } else {
        // For new day being created
        setSelectedLifts([...selectedLifts, selectedLiftId]);
      }
      setSelectedLiftId("");
    }
  };
  
  // Handle removing a lift from the day
  const handleRemoveLift = (liftId: string) => {
    if (day) {
      // For existing day
      removeLiftFromDay(splitId, dayIndex, liftId);
      setSelectedLifts(selectedLifts.filter(id => id !== liftId));
    } else {
      // For new day being created
      setSelectedLifts(selectedLifts.filter(id => id !== liftId));
    }
  };
  
  // Handle saving the day
  const handleSave = () => {
    if (!dayName.trim()) return;
    
    if (day) {
      // Update existing day
      updateDay(splitId, dayIndex, { name: dayName });
    } else {
      // Add new day
      addDayToSplit(splitId, {
        name: dayName,
        lifts: selectedLifts
      });
    }
    
    onSave();
  };
  
  // Get lift name from id
  const getLiftName = (liftId: string): string => {
    const lift = lifts.find(l => l.id === liftId);
    return lift ? lift.name : "Unknown";
  };
  
  return (
    <div className="bg-card p-4 rounded-lg pixel-border pixel-border-accent">
      <h3 className="font-pixel text-accent text-sm mb-4">{day ? 'EDIT DAY' : 'ADD DAY'}</h3>
      
      {/* Day Name Input */}
      <div className="mb-4">
        <label className="block text-xs mb-2">Day Name</label>
        <Input 
          type="text"
          value={dayName}
          onChange={(e) => setDayName(e.target.value)}
          placeholder="e.g. Push, Pull, Legs"
          className="bg-background text-white"
        />
      </div>
      
      {/* Lift Selection */}
      <div className="mb-4">
        <label className="block text-xs mb-2">Add Exercises</label>
        <div className="flex space-x-2">
          <Select value={selectedLiftId} onValueChange={setSelectedLiftId}>
            <SelectTrigger className="bg-background text-white">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {availableLifts.map((lift) => (
                <SelectItem key={lift.id} value={lift.id}>
                  {lift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddLift}
            disabled={!selectedLiftId}
            className="bg-accent text-white"
          >
            Add
          </Button>
        </div>
      </div>
      
      {/* Selected Lifts */}
      <div className="mb-4">
        <h4 className="text-xs font-medium mb-2">Selected Exercises</h4>
        {selectedLifts.length === 0 ? (
          <p className="text-xs text-gray-400">No exercises selected</p>
        ) : (
          <ul className="space-y-2">
            {selectedLifts.map((liftId) => (
              <li key={liftId} className="flex justify-between items-center bg-background p-2 rounded">
                <span className="text-sm">{getLiftName(liftId)}</span>
                <div className="flex space-x-2">
                  <LiftSettings liftId={liftId} onSave={() => {}} />
                  <Button
                    onClick={() => handleRemoveLift(liftId)}
                    variant="destructive"
                    size="sm"
                    className="h-6 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="border-accent text-accent"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!dayName.trim() || selectedLifts.length === 0}
          className="bg-accent text-white"
        >
          Save Day
        </Button>
      </div>
    </div>
  );
}