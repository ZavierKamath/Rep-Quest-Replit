import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import BottomNavigation from "./bottom-navigation";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [syncState, setSyncState] = useState<"synced" | "syncing" | "error">("synced");
  
  // Determine active tab based on location
  let activeTab: "train" | "splits" | "progress" = "train";
  if (location === "/splits") activeTab = "splits";
  if (location === "/progress") activeTab = "progress";
  
  // Demo sync animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate sync every 30 seconds
      setSyncState("syncing");
      setTimeout(() => {
        setSyncState("synced");
      }, 2000);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* App Header */}
      <header className="bg-background py-4 px-6 flex justify-between items-center pixel-border border-secondary">
        <h1 className="font-pixel text-xl text-secondary">REP QUEST</h1>
        <div className="flex space-x-2">
          {syncState === "syncing" && (
            <div className="flex items-center text-xs">
              <i className="ri-refresh-line mr-1 text-secondary animate-spin"></i>
              <span className="font-pixel text-xs text-secondary">SYNCING</span>
            </div>
          )}
          {syncState === "synced" && (
            <div className="flex items-center text-xs">
              <i className="ri-check-line mr-1 text-secondary"></i>
              <span className="font-pixel text-xs text-secondary">SYNCED</span>
            </div>
          )}
          {syncState === "error" && (
            <div className="flex items-center text-xs">
              <i className="ri-error-warning-line mr-1 text-destructive"></i>
              <span className="font-pixel text-xs text-destructive">ERROR</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-2 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-80 z-10">
            <div className="font-pixel text-secondary animate-pulse">LOADING...</div>
          </div>
        ) : (
          children
        )}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} />
    </div>
  );
}
