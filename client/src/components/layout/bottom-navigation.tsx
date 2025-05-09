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
          className={`flex-1 flex flex-col items-center ${activeTab === "train" ? "nav-active" : ""}`}
          onClick={() => handleTabChange("train")}
        >
          <i className="ri-heart-pulse-line text-xl"></i>
          <span className="text-xs mt-1 font-pixel">TRAIN</span>
        </button>
        <button
          className={`flex-1 flex flex-col items-center ${activeTab === "splits" ? "nav-active" : ""}`}
          onClick={() => handleTabChange("splits")}
        >
          <i className="ri-calendar-line text-xl"></i>
          <span className="text-xs mt-1 font-pixel">SPLITS</span>
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
