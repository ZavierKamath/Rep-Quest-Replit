import { format, subDays } from "date-fns";
import { LiftHistoryRecord } from "@/types";

interface ProgressChartProps {
  liftHistory: LiftHistoryRecord[];
}

export default function ProgressChart({ liftHistory }: ProgressChartProps) {
  // Process data for the chart (last 6 entries)
  const processChartData = () => {
    if (!liftHistory || liftHistory.length === 0) {
      // Generate empty placeholder data if no history
      return Array(6).fill({}).map((_, i) => ({
        date: format(subDays(new Date(), i * 7), "M/d"),
        weight: 0,
        isPR: false
      })).reverse();
    }
    
    // Sort history by date (oldest to newest)
    const sortedHistory = [...liftHistory].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Calculate PRs and create data points
    let currentPR = 0;
    const allDataPoints = sortedHistory.map(entry => {
      // Skip entries with no sets
      if (!entry.sets || entry.sets.length === 0) {
        return null;
      }
      
      // Find max weight for this entry
      const maxWeight = Math.max(...entry.sets.map(set => set.weight));
      
      // Check if this is a PR
      const isPR = maxWeight > currentPR;
      if (isPR) {
        currentPR = maxWeight;
      }
      
      return {
        date: format(new Date(entry.date), "M/d"),
        weight: maxWeight,
        isPR
      };
    }).filter(entry => entry !== null); // Remove null entries
    
    // If no valid data points, return empty
    if (allDataPoints.length === 0) {
      return Array(6).fill({}).map((_, i) => ({
        date: format(subDays(new Date(), i * 7), "M/d"),
        weight: 0,
        isPR: false
      })).reverse();
    }
    
    // Get last 6 entries (or all if less than 6)
    const lastSixEntries = allDataPoints.length <= 6 
      ? allDataPoints 
      : allDataPoints.slice(-6);
    
    return lastSixEntries;
  };
  
  const chartData = processChartData();
  
  // Calculate max value for chart height normalization with a minimum of 10
  const maxValue = Math.max(10, ...chartData.map(d => d.weight));
  const hasData = chartData.some(d => d.weight > 0);
  
  return (
    <>
      {/* Chart Container */}
      <div className="h-48 flex items-end justify-between space-x-1 px-2 relative">
        {/* No data message */}
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No weight data yet
          </div>
        )}
        
        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div 
              className={`${data.isPR ? 'bg-secondary' : 'bg-primary'} w-8 rounded-t-sm ${data.weight > 0 ? 'pixel-border border-b-0' : ''}`}
              style={{ 
                height: `${data.weight > 0 ? Math.max(5, (data.weight / maxValue) * 100) : 0}%`,
                opacity: data.weight > 0 ? 1 : 0
              }}
            ></div>
            
            {/* Weight label on top of bar */}
            {data.weight > 0 && (
              <div className="absolute -top-6 text-xs font-pixel text-white">
                {data.weight}
              </div>
            )}
            
            {/* Date label */}
            <span className="text-xs mt-1 text-gray-400">{data.date}</span>
          </div>
        ))}
      </div>
      
      {/* Chart Legend */}
      <div className="flex justify-between mt-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary mr-1"></div>
          <span className="text-gray-300">Regular Sets</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-secondary mr-1"></div>
          <span className="text-gray-300">PR (Personal Record)</span>
        </div>
      </div>
    </>
  );
}
