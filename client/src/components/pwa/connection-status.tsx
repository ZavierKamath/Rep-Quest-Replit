import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Component that displays the current online/offline status
 * and notifies the user when the status changes.
 */
const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Update status when it changes
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      
      // Hide the status after a delay
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If the status is online and we shouldn't show it, don't render anything
  if (isOnline && !showStatus) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 left-0 right-0 p-2 text-white z-50 transition-colors duration-300 ${
        isOnline ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <div className="container mx-auto flex items-center justify-center">
        {isOnline ? (
          <>
            <Wifi size={18} className="mr-2" />
            <span>You're back online. Syncing data...</span>
          </>
        ) : (
          <>
            <WifiOff size={18} className="mr-2" />
            <span>You're offline. Your changes will be saved locally.</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus; 