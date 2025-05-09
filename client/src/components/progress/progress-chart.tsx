import { format, subDays } from "date-fns";
import { LiftHistoryRecord } from "@/types";

interface ProgressChartProps {
  liftHistory: LiftHistoryRecord[];
}

export default function ProgressChart({ liftHistory }: ProgressChartProps) {
  // Process data for the chart (last 6 entries)
  const processChartData = () => {
    if (!liftHistory.length) {
      // Generate placeholder data if no history
      const placeholderData = [];
      for (let i = 5; i >= 0; i--) {
        placeholderData.push({
          date: format(subDays(new Date(), i * 7), "M/d"),
          weight: 0,
          isPR: false
        });
      }
      return placeholderData;
    }
    
    // Sort by date
    const sortedHistory = [...liftHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get last 6 entries
    const lastSixEntries = sortedHistory.slice(-6);
    
    // Calculate max weight for each entry and determine if it's a PR
    let currentPR = 0;
    return lastSixEntries.map(entry => {
      const maxWeight = Math.max(...entry.sets.map(set => set.weight));
      const isPR = maxWeight > currentPR;
      if (isPR) currentPR = maxWeight;
      
      return {
        date: format(new Date(entry.date), "M/d"),
        weight: maxWeight,
        isPR
      };
    });
  };
  
  const chartData = processChartData();
  
  // Calculate max value for chart height normalization
  const maxValue = Math.max(...chartData.map(d => d.weight)) || 100;
  
  return (
    <>
      {/* Chart Container */}
      <div className="h-48 flex items-end justify-between space-x-1 px-2">
        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className={`${data.isPR ? 'bg-secondary' : 'bg-primary'} w-6`}
              style={{ height: `${(data.weight / maxValue) * 100}%` }}
            ></div>
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
