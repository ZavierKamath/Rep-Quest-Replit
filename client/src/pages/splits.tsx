import { useState } from "react";
import { useWorkout } from "@/context/workout-context";
import { Button } from "@/components/ui/button";
import { Split } from "@/types";

export default function SplitsPage() {
  const { 
    splits, 
    activeSplit, 
    setActiveSplit,
    createSplit
  } = useWorkout();
  
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSplitName, setNewSplitName] = useState("");

  const handleActivateSplit = (splitId: string) => {
    setActiveSplit(splitId);
  };

  const handleNewSplit = () => {
    if (newSplitName.trim()) {
      createSplit({
        id: Date.now().toString(),
        name: newSplitName,
        days: []
      });
      setNewSplitName("");
      setIsCreatingNew(false);
    }
  };

  // Filter other splits (non-active)
  const otherSplits = splits.filter(split => split.id !== activeSplit?.id);

  return (
    <div className="py-4">
      <h2 className="font-pixel text-lg text-secondary mb-6 text-center">WORKOUT SPLITS</h2>
      
      {/* Active Split */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-pixel text-sm text-white">ACTIVE SPLIT</h3>
          <Button 
            onClick={() => setIsEditingActive(!isEditingActive)}
            className="bg-secondary text-dark px-4 py-1 rounded text-xs font-pixel pixel-border pixel-border-accent"
          >
            EDIT
          </Button>
        </div>
        
        {activeSplit && (
          <div className="bg-[hsl(var(--card))] rounded-lg p-4 pixel-border pixel-border-secondary">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-body font-medium text-white">{activeSplit.name}</h3>
              <span className="bg-secondary text-dark px-2 py-1 rounded-full text-xs">Active</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              {activeSplit.days.map((day, index) => {
                // Rotate between primary, accent, and secondary for styling
                const borderClasses = [
                  "pixel-border-primary",
                  "pixel-border-accent",
                  "pixel-border-secondary"
                ];
                const textClasses = [
                  "text-primary",
                  "text-accent",
                  "text-secondary"
                ];
                const borderClass = borderClasses[index % 3];
                const textClass = textClasses[index % 3];
                
                return (
                  <div key={index} className={`bg-background p-3 rounded text-center pixel-border ${borderClass}`}>
                    <span className={`text-xs font-pixel ${textClass}`}>{day.name.toUpperCase()}</span>
                    <p className="text-xs text-gray-400 mt-1">{day.lifts.length} lifts</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Other Splits */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-pixel text-sm text-white">OTHER SPLITS</h3>
          {!isCreatingNew ? (
            <Button 
              onClick={() => setIsCreatingNew(true)}
              className="bg-accent text-white px-4 py-1 rounded text-xs font-pixel pixel-border pixel-border-secondary"
            >
              NEW
            </Button>
          ) : (
            <div className="flex space-x-2">
              <input 
                type="text" 
                value={newSplitName}
                onChange={(e) => setNewSplitName(e.target.value)}
                className="bg-background text-white text-xs px-2 py-1 rounded pixel-border"
                placeholder="Split name"
              />
              <Button 
                onClick={handleNewSplit}
                className="bg-secondary text-dark px-2 py-1 rounded text-xs font-pixel"
              >
                SAVE
              </Button>
              <Button 
                onClick={() => setIsCreatingNew(false)}
                className="bg-destructive text-white px-2 py-1 rounded text-xs font-pixel"
              >
                X
              </Button>
            </div>
          )}
        </div>
        
        {/* Split Cards */}
        <div className="space-y-4">
          {otherSplits.map((split) => (
            <div key={split.id} className="bg-[hsl(var(--card))] rounded-lg p-4 pixel-border pixel-border-muted">
              <h3 className="font-body font-medium text-white mb-2">{split.name}</h3>
              
              <div className={`grid grid-cols-${Math.min(3, split.days.length)} gap-2 mt-3`}>
                {split.days.map((day, index) => (
                  <div key={index} className="bg-background p-3 rounded text-center pixel-border border-muted">
                    <span className="text-xs font-pixel text-gray-300">{day.name.toUpperCase()}</span>
                    <p className="text-xs text-gray-400 mt-1">{day.lifts.length} lifts</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-3">
                <Button 
                  onClick={() => handleActivateSplit(split.id)}
                  className="text-secondary text-xs font-pixel bg-transparent hover:bg-transparent"
                >
                  ACTIVATE
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
