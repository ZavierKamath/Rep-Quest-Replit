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
    <nav className="bg-background py-3 pb-4 pt-4 px-0 pixel-border border-t border-primary">
      <div className="flex justify-around">
        {/* Split Tab */}
        <button
          className={`flex-1 flex flex-col items-center mx-2 px-2 py-2 rounded-md transition-all duration-200
            ${activeTab === "splits" 
              ? "bg-primary/40 text-secondary nav-active-subtle" 
              : "bg-transparent hover:bg-muted/30"
            }`}
          onClick={() => handleTabChange("splits")}
        >
          <i className={`ri-calendar-line text-xl ${activeTab === "splits" ? "text-secondary" : ""}`}></i>
          <span className={`text-xs mt-1 font-pixel ${activeTab === "splits" ? "text-secondary" : ""}`}>
            SPLITS
          </span>
        </button>
        
        {/* Train Tab - middle position with enhanced styling */}
        <button
          className={`flex-1 flex flex-col items-center mx-2 px-4 py-2 rounded-md transition-all duration-200
            ${activeTab === "train" 
              ? "bg-primary/40 text-secondary nav-active-subtle" 
              : "bg-transparent hover:bg-muted/30"
            }`}
          onClick={() => handleTabChange("train")}
        >
          <div className={`
            ${activeTab === "train" 
              ? "text-secondary"
              : ""
            } 
            transition-all duration-200
          `}>
            <i className="ri-heart-pulse-line text-2xl"></i>
          </div>
          <span className={`text-xs font-pixel mt-1 ${activeTab === "train" ? "text-secondary" : ""}`}>
            TRAIN
          </span>
        </button>
        
        {/* Progress Tab */}
        <button
          className={`flex-1 flex flex-col items-center mx-2 px-2 py-2 rounded-md transition-all duration-200
            ${activeTab === "progress" 
              ? "bg-primary/40 text-secondary nav-active-subtle" 
              : "bg-transparent hover:bg-muted/30"
            }`}
          onClick={() => handleTabChange("progress")}
        >
          <i className={`ri-bar-chart-line text-xl ${activeTab === "progress" ? "text-secondary" : ""}`}></i>
          <span className={`text-xs mt-1 font-pixel ${activeTab === "progress" ? "text-secondary" : ""}`}>
            PROGRESS
          </span>
        </button>
      </div>
    </nav>
  );
}
