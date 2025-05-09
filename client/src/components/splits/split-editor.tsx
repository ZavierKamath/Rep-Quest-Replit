import { useState } from "react";
import { useWorkout } from "@/context/workout-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Split, Day } from "@/types";
import DayEditor from "./day-editor";

interface SplitEditorProps {
  split: Split | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function SplitEditor({ split, onSave, onCancel }: SplitEditorProps) {
  const { createSplit, updateSplit, deleteDay } = useWorkout();
  
  const [splitName, setSplitName] = useState(split?.name || "");
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [isAddingDay, setIsAddingDay] = useState(false);
  
  // Handle saving the split
  const handleSaveSplit = () => {
    if (!splitName.trim()) return;
    
    if (split) {
      // Update existing split
      updateSplit(split.id, { name: splitName });
    } else {
      // Create new split
      createSplit({
        id: Date.now().toString(),
        name: splitName,
        days: []
      });
    }
    
    onSave();
  };
  
  // Handle editing a day
  const handleEditDay = (index: number) => {
    setEditingDayIndex(index);
    setIsAddingDay(false);
  };
  
  // Handle deleting a day
  const handleDeleteDay = (index: number) => {
    if (split) {
      deleteDay(split.id, index);
    }
  };
  
  // Handle day editor close
  const handleDayEditorClose = () => {
    setEditingDayIndex(null);
    setIsAddingDay(false);
  };
  
  return (
    <div className="bg-card p-4 rounded-lg pixel-border pixel-border-primary">
      <h3 className="font-pixel text-primary text-sm mb-4">{split ? 'EDIT SPLIT' : 'CREATE SPLIT'}</h3>
      
      {/* Split Name Input */}
      <div className="mb-4">
        <label className="block text-xs mb-2">Split Name</label>
        <Input 
          type="text"
          value={splitName}
          onChange={(e) => setSplitName(e.target.value)}
          placeholder="e.g. Push Pull Legs"
          className="bg-background text-white"
        />
      </div>
      
      {split && !isAddingDay && editingDayIndex === null && (
        <>
          {/* Days List */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-medium">Days</h4>
              <Button
                onClick={() => setIsAddingDay(true)}
                className="bg-secondary text-dark h-7 text-xs"
              >
                Add Day
              </Button>
            </div>
            
            {split.days.length === 0 ? (
              <p className="text-xs text-gray-400">No days in this split</p>
            ) : (
              <ul className="space-y-2">
                {split.days.map((day, index) => (
                  <li key={index} className="flex justify-between items-center bg-background p-2 rounded">
                    <div>
                      <span className="text-sm font-medium">{day.name}</span>
                      <p className="text-xs text-gray-400">{day.lifts.length} exercises</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditDay(index)}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-secondary text-secondary"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteDay(index)}
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        Delete
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
              className="border-primary text-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSplit}
              disabled={!splitName.trim()}
              className="bg-primary text-white"
            >
              Save Split
            </Button>
          </div>
        </>
      )}
      
      {/* New Split - No Days Yet */}
      {!split && !isAddingDay && (
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-primary text-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSplit}
            disabled={!splitName.trim()}
            className="bg-primary text-white"
          >
            Create Split
          </Button>
        </div>
      )}
      
      {/* Day Editor */}
      {split && isAddingDay && (
        <DayEditor
          splitId={split.id}
          day={null}
          dayIndex={split.days.length}
          onSave={handleDayEditorClose}
          onCancel={handleDayEditorClose}
        />
      )}
      
      {/* Edit Existing Day */}
      {split && editingDayIndex !== null && (
        <DayEditor
          splitId={split.id}
          day={split.days[editingDayIndex]}
          dayIndex={editingDayIndex}
          onSave={handleDayEditorClose}
          onCancel={handleDayEditorClose}
        />
      )}
    </div>
  );
}