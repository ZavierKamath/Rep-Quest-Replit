import { useLocation } from "wouter";

interface BottomNavigationProps {
  activeTab: "train" | "splits" | "progress";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const [_, setLocation] = useLocation();
  
  const handleTabChange = (tab: string) => {
    if (tab === "train") setLocation("/");
    else setLocation(`/${tab}`);
  };
  
  return (
    <nav className="bg-background py-3 px-2 pixel-border border-t border-primary">
      <div className="flex justify-around">
        <button
          className={`flex-1 flex flex-col items-center ${activeTab === "splits" ? "nav-active" : ""}`}
          onClick={() => handleTabChange("splits")}
        >
          <i className="ri-calendar-line text-xl"></i>
          <span className="text-xs mt-1 font-pixel">SPLITS</span>
        </button>
        
        {/* Train tab - middle position with enhanced styling */}
        <button
          className={`flex-1 flex flex-col items-center ${
            activeTab === "train" 
              ? "nav-active" 
              : ""
          }`}
          onClick={() => handleTabChange("train")}
        >
          <div className={`
            ${activeTab === "train" 
              ? "bg-secondary shadow-lg" 
              : "bg-primary"
            } 
            w-14 h-14 rounded-full -mt-8 flex items-center justify-center
            pixel-border border-2 transition-all duration-200
          `}>
            <i className="ri-heart-pulse-line text-2xl"></i>
          </div>
          <span className={`text-xs font-pixel mt-1 ${activeTab === "train" ? "text-secondary" : ""}`}>TRAIN</span>
        </button>
        
        <button
          className={`flex-1 flex flex-col items-center ${activeTab === "progress" ? "nav-active" : ""}`}
          onClick={() => handleTabChange("progress")}
        >
          <i className="ri-bar-chart-line text-xl"></i>
          <span className="text-xs mt-1 font-pixel">PROGRESS</span>
        </button>
      </div>
    </nav>
  );
}
