import { useState, useEffect } from "react";
import { useWorkout } from "@/context/workout-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lift } from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface LiftSettingsProps {
  liftId: string;
  onSave: () => void;
}

interface ExtendedLift extends Lift {
  defaultReps?: number;
}

export default function LiftSettings({ liftId, onSave }: LiftSettingsProps) {
  const { lifts, updateLiftSettings } = useWorkout();
  const lift = lifts.find(l => l.id === liftId);
  
  const [defaultWeight, setDefaultWeight] = useState(lift?.defaultWeight || 0);
  const [weightIncrement, setWeightIncrement] = useState(lift?.weightIncrement || 0);
  const [defaultReps, setDefaultReps] = useState((lift as ExtendedLift)?.defaultReps || 8);
  const [isOpen, setIsOpen] = useState(false);
  
  // Reset form when lift changes
  useEffect(() => {
    if (lift) {
      setDefaultWeight(lift.defaultWeight);
      setWeightIncrement(lift.weightIncrement);
      setDefaultReps((lift as ExtendedLift)?.defaultReps || 8);
    }
  }, [lift]);
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setDefaultWeight(value);
    }
  };
  
  const handleIncrementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setWeightIncrement(value);
    }
  };
  
  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setDefaultReps(value);
    }
  };
  
  const handleSave = () => {
    if (lift) {
      updateLiftSettings(liftId, {
        defaultWeight,
        weightIncrement,
        defaultReps
      } as ExtendedLift);
      setIsOpen(false);
      onSave();
    }
  };
  
  if (!lift) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2 border-primary text-primary"
        >
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-primary">
        <DialogHeader>
          <DialogTitle className="font-pixel text-primary">{lift.name.toUpperCase()} SETTINGS</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Configure your exercise preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs mb-2">Default Weight (lbs)</label>
            <Input
              type="number"
              value={defaultWeight}
              onChange={handleWeightChange}
              min={0}
              step={5}
              className="bg-background text-white"
            />
            <p className="text-gray-400 text-xs mt-1">Starting weight for this exercise</p>
          </div>
          
          <div>
            <label className="block text-xs mb-2">Weight Increment (lbs)</label>
            <Input
              type="number"
              value={weightIncrement}
              onChange={handleIncrementChange}
              min={0}
              step={2.5}
              className="bg-background text-white"
            />
            <p className="text-gray-400 text-xs mt-1">How much to increase/decrease weight by default</p>
          </div>
          
          <div>
            <label className="block text-xs mb-2">Default Reps</label>
            <Input
              type="number"
              value={defaultReps}
              onChange={handleRepsChange}
              min={1}
              max={30}
              step={1}
              className="bg-background text-white"
            />
            <p className="text-gray-400 text-xs mt-1">Target reps for each set</p>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-destructive text-destructive">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} className="bg-primary text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}