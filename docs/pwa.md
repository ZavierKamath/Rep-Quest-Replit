# Progressive Web App (PWA) Features

RepQuestTracker has been enhanced with Progressive Web App capabilities, allowing it to be installed on devices and used offline, providing a more native app-like experience.

## Overview

The PWA implementation includes the following features:

1. **Web App Manifest** - Defines app metadata for installation
2. **Service Worker** - Handles caching and offline functionality
3. **Offline Storage** - Using IndexedDB for offline data persistence
4. **App Installation** - Prompts user to install the app on their device
5. **Online/Offline Status** - Visual indicators for connectivity changes

## Implementation Details

### Web App Manifest

The `manifest.json` file provides metadata for the browser about the application:

- **Name & Short Name**: The full name and shorthand name for the app
- **Icons**: App icons in various sizes for different contexts
- **Start URL**: The starting URL when launched from the home screen
- **Display**: Set to "standalone" for an app-like experience (no browser UI)
- **Theme & Background Colors**: Defining the color scheme

### Service Worker

The service worker (`service-worker.js`) provides:

- **Caching**: Caches app shell resources for offline access
- **Offline Fallback**: Shows an offline page when the network is unavailable
- **API Response Caching**: Caches API responses for offline access
- **Background Sync**: Syncs data saved offline when connectivity is restored

### IndexedDB Storage

The app uses IndexedDB (via the `idb.ts` utility) to:

- Store workout data locally when fetched from the server
- Save new workout data locally when offline
- Queue data for synchronization when offline
- Provide access to data when offline

### Offline-First API

The API service has been redesigned with an offline-first approach:

- Attempts to get data from the network first
- Falls back to local storage when offline or when network requests fail
- Saves data locally first, then syncs to the server
- Automatically syncs local changes when connectivity is restored

### Installation Components

UI components have been added to enhance the PWA experience:

- `InstallPrompt`: Provides a custom prompt for app installation
- `ConnectionStatus`: Shows online/offline status notifications

## Testing the PWA

### Installation

1. Visit the app in a supported browser (like Chrome or Safari)
2. On iOS:
   - Tap the Share button
   - Select "Add to Home Screen"
3. On Android:
   - Tap the menu button (three dots)
   - Select "Add to Home Screen" or "Install App"

### Offline Usage

1. Install the app as described above
2. Open the app and let it load fully
3. Put your device in airplane mode or disconnect from the network
4. You should still be able to:
   - Access the app
   - View previously loaded data
   - Create new workouts (which will sync when back online)

## Browser Compatibility

PWA features are supported in most modern browsers:

- Chrome (Android and Desktop): Full support
- Safari (iOS 11.3+): Good support with some limitations
- Firefox: Good support
- Edge: Good support

Note that some browsers have limitations with certain PWA features. For instance:
- iOS Safari has limited support for background sync
- Some browsers may handle caching differently

## Future Enhancements

Possible future PWA improvements:

- Push notifications for workout reminders
- More sophisticated offline data conflict resolution
- Enhanced installation prompts and guidance for different platforms 