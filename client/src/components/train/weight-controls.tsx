import { useState } from "react";

interface WeightControlsProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function WeightControls({
  value,
  onChange,
  min = 5,
  max = 500,
  step = 5
}: WeightControlsProps) {
  
  const handleIncrease = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };
  
  const handleDecrease = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };
  
  return (
    <div className="custom-number-input flex items-center">
      <button 
        className="weight-control bg-background text-white rounded-l-md pixel-border border-muted"
        onClick={handleDecrease}
      >
        -
      </button>
      <input 
        type="number" 
        value={value} 
        min={min} 
        max={max}
        step={step} 
        className="w-16 text-center bg-background border-y-2 border-muted text-white py-1" 
        onChange={handleInputChange}
      />
      <button 
        className="weight-control bg-background text-white rounded-r-md pixel-border border-muted"
        onClick={handleIncrease}
      >
        +
      </button>
    </div>
  );
}
