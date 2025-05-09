import { useState } from "react";

interface RepCounterProps {
  maxReps: number;
  value: number | null;
  onChange: (value: number) => void;
}

export default function RepCounter({ maxReps, value, onChange }: RepCounterProps) {
  // Create arrays of buttons (split into rows of 4)
  const createButtonRows = () => {
    const buttons = [];
    for (let i = 0; i < maxReps; i++) {
      buttons.push(i + 1);
    }
    
    // Split into rows of 4
    const rows = [];
    for (let i = 0; i < buttons.length; i += 4) {
      rows.push(buttons.slice(i, i + 4));
    }
    
    return rows;
  };
  
  const buttonRows = createButtonRows();
  
  return (
    <div>
      {buttonRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2 mb-2">
          {row.map((reps) => (
            <button
              key={reps}
              className={`h-8 w-8 rounded-md flex items-center justify-center transition-all duration-200 ${
                value === reps 
                  ? "bg-secondary text-dark pixel-border pixel-border-secondary" 
                  : "bg-background pixel-border border-muted hover:border-secondary"
              }`}
              onClick={() => onChange(reps)}
            >
              <span>{reps}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
