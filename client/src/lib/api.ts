/**
 * API service for handling requests to the server
 * Includes fallback to local storage for offline support
 */

import { storeWorkout, getAllWorkouts } from './idb';

// Base URL for API endpoints
const API_BASE_URL = '/api';

// Enhanced logging function
const clientLog = (source: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] client/src/lib/api.ts:${source}: ${message}`, data ? data : '');
};

// Generic fetch wrapper with timeout and error handling
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> => {
  clientLog('fetchWithTimeout', `Making request to ${url}`, { 
    method: options.method || 'GET',
    hasBody: !!options.body
  });
  
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort();
    clientLog('fetchWithTimeout', `Request to ${url} timed out after ${timeout}ms`);
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(id);

    clientLog('fetchWithTimeout', `Response from ${url}`, { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (!response.ok) {
      const error = await response.text();
      clientLog('fetchWithTimeout', `Error response from ${url}`, { 
        status: response.status, 
        error 
      });
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error) {
      clientLog('fetchWithTimeout', `Fetch error: ${error.message}`, { 
        url,
        stack: error.stack
      });
    }
    throw error;
  }
};

/**
 * Workout API functions
 */

// Get workout data for a specific user
export const getWorkoutData = async (userId: number): Promise<any> => {
  clientLog('getWorkoutData', `Fetching workout data for user: ${userId}`, { 
    isOnline: navigator.onLine 
  });
  
  try {
    // Try online request first
    if (navigator.onLine) {
      clientLog('getWorkoutData', `Making online request for user: ${userId}`);
      const response = await fetchWithTimeout(`${API_BASE_URL}/workout-data/${userId}`);
      const data = await response.json();

      clientLog('getWorkoutData', `Received workout data for user: ${userId}`, { 
        dataReceived: !!data,
        dataSize: data ? JSON.stringify(data).length : 0
      });

      // Store the data locally for offline use
      if (data) {
        clientLog('getWorkoutData', `Storing workout data locally for user: ${userId}`);
        await storeWorkout({
          userId,
          data,
          timestamp: new Date().toISOString()
        });
      }

      return data;
    } else {
      clientLog('getWorkoutData', 'Device is offline, getting workout data from IndexedDB');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    clientLog('getWorkoutData', `Error fetching workout data from server: ${errorMessage}`, {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('API: Error fetching workout data from server', error);
    clientLog('getWorkoutData', 'Falling back to local data');
  }

  // Fallback to IndexedDB if offline or request failed
  clientLog('getWorkoutData', 'Retrieving data from IndexedDB');
  const localWorkouts = await getAllWorkouts();
  
  // Find the most recent workout data for this user
  const userWorkouts = localWorkouts
    .filter(workout => workout.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const hasLocalData = userWorkouts.length > 0;
  clientLog('getWorkoutData', `Local data ${hasLocalData ? 'found' : 'not found'} for user: ${userId}`, {
    workoutCount: userWorkouts.length
  });
  
  return userWorkouts.length > 0 ? userWorkouts[0].data : null;
};

// Save workout data
export const saveWorkoutData = async (workoutData: any): Promise<any> => {
  clientLog('saveWorkoutData', 'Saving workout data', { 
    userId: workoutData.userId,
    isOnline: navigator.onLine,
    dataSize: JSON.stringify(workoutData.data).length
  });
  
  try {
    // Save to local storage first (for optimistic UI updates and offline support)
    clientLog('saveWorkoutData', 'Storing data in IndexedDB first');
    await storeWorkout(workoutData);
    
    // If online, save to server
    if (navigator.onLine) {
      clientLog('saveWorkoutData', 'Device is online, sending data to server');
      const response = await fetchWithTimeout(`${API_BASE_URL}/workout-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });
      
      const responseData = await response.json();
      clientLog('saveWorkoutData', 'Data successfully saved to server', {
        responseId: responseData.id
      });
      
      return responseData;
    } else {
      clientLog('saveWorkoutData', 'Device is offline, workout data saved locally and will sync later');
      // Return the local data for optimistic UI updates
      return workoutData;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    clientLog('saveWorkoutData', `Error saving workout data: ${errorMessage}`, {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('API: Error saving workout data', error);
    throw error;
  }
};

// Get available lifts
export const getLifts = async (userId = 1): Promise<any[]> => {
  clientLog('getLifts', `Fetching lifts for user: ${userId}`, {
    isOnline: navigator.onLine
  });
  
  try {
    // Try online request first
    if (navigator.onLine) {
      clientLog('getLifts', 'Making request to server');
      const response = await fetchWithTimeout(`${API_BASE_URL}/lifts`);
      const lifts = await response.json();
      
      clientLog('getLifts', `Retrieved ${lifts.length} lifts from server`);
      return lifts;
    } else {
      clientLog('getLifts', 'Device is offline, cannot fetch lifts');
      throw new Error('Cannot fetch lifts while offline');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    clientLog('getLifts', `Error fetching lifts: ${errorMessage}`, {
      error,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('API: Error fetching lifts', error);
    throw error;
  }
};

/**
 * Check online status and register event listeners
 */

// Online status tracking
let isOnline = navigator.onLine;
clientLog('init', `Initial online status: ${isOnline ? 'online' : 'offline'}`);

// Update online status
const updateOnlineStatus = () => {
  const wasOnline = isOnline;
  isOnline = navigator.onLine;
  
  clientLog('updateOnlineStatus', `Connection status changed: ${wasOnline ? 'online' : 'offline'} -> ${isOnline ? 'online' : 'offline'}`);
  
  if (!wasOnline && isOnline) {
    clientLog('updateOnlineStatus', 'Connection restored, triggering sync');
    // Trigger sync via service worker
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      clientLog('updateOnlineStatus', 'Registering sync with service worker');
      navigator.serviceWorker.ready
        .then(registration => {
          if ('sync' in registration) {
            return (registration as any).sync.register('sync-workouts');
          }
          clientLog('updateOnlineStatus', 'Sync API not available in service worker');
          return Promise.resolve();
        })
        .then(() => clientLog('updateOnlineStatus', 'Sync registered after coming online'))
        .catch(err => {
          clientLog('updateOnlineStatus', `Sync registration failed: ${err.message}`, {
            error: err,
            stack: err.stack
          });
          console.error('API: Sync registration failed', err);
        });
    } else {
      clientLog('updateOnlineStatus', 'ServiceWorker or SyncManager not supported');
    }
  }
};

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus(); 