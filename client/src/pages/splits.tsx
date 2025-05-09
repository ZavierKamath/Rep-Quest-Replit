import { useState } from "react";
import { useWorkout } from "@/context/workout-context";
import { Button } from "@/components/ui/button";
import { Split, Day } from "@/types";
import SplitEditor from "@/components/splits/split-editor";

export default function SplitsPage() {
  const { 
    splits, 
    currentSplit, 
    setActiveSplit,
    updateSplit,
    deleteDay,
    addDayToSplit
  } = useWorkout();
  
  const [editingSplitId, setEditingSplitId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [expandedSplitId, setExpandedSplitId] = useState<string | null>(null);

  // Handle activate split
  const handleActivateSplit = (splitId: string) => {
    setActiveSplit(splitId);
  };

  // Handle edit split
  const handleEditSplit = (splitId: string) => {
    setEditingSplitId(splitId);
    setIsCreatingNew(false);
  };

  // Handle editing active split
  const handleEditActiveSplit = () => {
    if (currentSplit) {
      setEditingSplitId(currentSplit.id);
      setIsCreatingNew(false);
    }
  };

  // Handle create new split
  const handleCreateNewSplit = () => {
    setIsCreatingNew(true);
    setEditingSplitId(null);
  };

  // Handle split editor close
  const handleSplitEditorClose = () => {
    setEditingSplitId(null);
    setIsCreatingNew(false);
  };

  // Handle expand/collapse split
  const handleToggleExpandSplit = (splitId: string) => {
    if (expandedSplitId === splitId) {
      setExpandedSplitId(null);
    } else {
      setExpandedSplitId(splitId);
    }
  };

  // Filter other splits (non-active)
  const otherSplits = splits.filter(split => split.id !== currentSplit?.id);

  return (
    <div className="py-4">
      <h2 className="font-pixel text-lg text-secondary mb-6 text-center">WORKOUT SPLITS</h2>
      
      {/* Split Creation/Editing */}
      {isCreatingNew && (
        <div className="mb-6">
          <SplitEditor 
            split={null}
            onSave={handleSplitEditorClose}
            onCancel={handleSplitEditorClose}
          />
        </div>
      )}

      {editingSplitId && (
        <div className="mb-6">
          <SplitEditor 
            split={splits.find(s => s.id === editingSplitId) || null}
            onSave={handleSplitEditorClose}
            onCancel={handleSplitEditorClose}
          />
        </div>
      )}
      
      {/* Active Split */}
      {!isCreatingNew && !editingSplitId && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-pixel text-sm text-white">ACTIVE SPLIT</h3>
            <Button 
              onClick={handleEditActiveSplit}
              className="bg-secondary text-dark px-4 py-1 rounded text-xs font-pixel pixel-border pixel-border-accent"
              disabled={!currentSplit}
            >
              EDIT
            </Button>
          </div>
          
          {currentSplit ? (
            <div className="bg-[hsl(var(--card))] rounded-lg p-4 pixel-border pixel-border-secondary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-body font-medium text-white">{currentSplit.name}</h3>
                <span className="bg-secondary text-dark px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              
              {currentSplit.days.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {currentSplit.days.map((day: Day, index: number) => {
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
              ) : (
                <div className="mt-2 text-center">
                  <p className="text-gray-400 text-sm">No workout days configured</p>
                  <Button 
                    onClick={handleEditActiveSplit}
                    className="mt-2 bg-accent text-white text-xs"
                  >
                    Add Days
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[hsl(var(--card))] rounded-lg p-6 text-center pixel-border pixel-border-muted">
              <p className="text-gray-400">No active split selected</p>
              <p className="text-gray-500 text-xs mt-1">Activate a split from below or create a new one</p>
            </div>
          )}
        </div>
      )}
      
      {/* Other Splits */}
      {!isCreatingNew && !editingSplitId && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-pixel text-sm text-white">OTHER SPLITS</h3>
            <Button 
              onClick={handleCreateNewSplit}
              className="bg-accent text-white px-4 py-1 rounded text-xs font-pixel pixel-border pixel-border-secondary"
            >
              NEW
            </Button>
          </div>
          
          {/* Split Cards */}
          <div className="space-y-4">
            {otherSplits.length === 0 ? (
              <div className="bg-[hsl(var(--card))] rounded-lg p-6 text-center pixel-border pixel-border-muted">
                <p className="text-gray-400">No other splits available</p>
                <Button
                  onClick={handleCreateNewSplit}
                  className="mt-3 bg-accent text-white text-xs"
                >
                  Create New Split
                </Button>
              </div>
            ) : (
              otherSplits.map((split) => (
                <div key={split.id} className="bg-[hsl(var(--card))] rounded-lg p-4 pixel-border pixel-border-muted">
                  <div className="flex justify-between items-center">
                    <h3 className="font-body font-medium text-white">{split.name}</h3>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleToggleExpandSplit(split.id)}
                        className="h-7 w-7 p-0 bg-background text-primary text-xs rounded-full"
                        title={expandedSplitId === split.id ? "Collapse" : "Expand"}
                      >
                        {expandedSplitId === split.id ? "−" : "+"}
                      </Button>
                    </div>
                  </div>
                  
                  {expandedSplitId === split.id && (
                    <div className="mt-3">
                      {split.days.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {split.days.map((day, index) => (
                            <div key={index} className="bg-background p-3 rounded text-center pixel-border border-muted">
                              <span className="text-xs font-pixel text-gray-300">{day.name.toUpperCase()}</span>
                              <p className="text-xs text-gray-400 mt-1">{day.lifts.length} lifts</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-2">No workout days configured</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-3 space-x-2">
                    <Button 
                      onClick={() => handleEditSplit(split.id)}
                      className="bg-accent text-white text-xs h-7"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleActivateSplit(split.id)}
                      className="bg-secondary text-dark text-xs h-7"
                    >
                      Activate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
