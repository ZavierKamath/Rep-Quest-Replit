import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

/**
 * Component that displays a prompt for users to install the PWA to their device.
 * This utilizes the beforeinstallprompt event which fires when the PWA is installable.
 */
const InstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if the prompt has been dismissed before
    const promptDismissed = localStorage.getItem('pwa-install-prompt-dismissed');
    if (promptDismissed) {
      setDismissed(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the default behavior (older browsers showed a default install dialog)
      event.preventDefault();
      
      // Cast to our extended interface
      const promptEvent = event as BeforeInstallPromptEvent;
      
      // Store the event so it can be triggered later
      setInstallPromptEvent(promptEvent);
      
      // Show our custom install prompt
      setShowPrompt(true);
      
      console.log('PWA: Install prompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle the install button click
  const handleInstallClick = () => {
    if (!installPromptEvent) {
      console.log('PWA: Install prompt event is null');
      return;
    }

    // Show the install prompt
    installPromptEvent.prompt();

    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      // No longer need the prompt event
      setInstallPromptEvent(null);
      setShowPrompt(false);
    });
  };

  // Handle the dismiss button click
  const handleDismissClick = () => {
    setShowPrompt(false);
    setDismissed(true);
    
    // Remember that the user dismissed the prompt
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  // If the prompt has been dismissed or shouldn't be shown, don't render anything
  if (dismissed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 text-white z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium">Install Rep Quest Tracker</h3>
          <p className="text-sm text-gray-300">
            Install this app on your device for offline access to your workout data.
          </p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium"
          >
            Install
          </button>
          <button
            onClick={handleDismissClick}
            className="p-2 rounded-md hover:bg-gray-700"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt; 