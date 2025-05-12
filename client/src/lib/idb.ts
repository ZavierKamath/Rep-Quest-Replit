/**
 * IndexedDB utilities for offline data storage
 * This enables the app to store workout data locally when offline
 * and sync it when back online.
 */

// Database name and version
const DB_NAME = 'repquest-tracker-db';
const DB_VERSION = 1;

// Open the database
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // Handle database upgrade (runs when DB is created or version is upgraded)
    request.onupgradeneeded = (event) => {
      console.log('IndexedDB: Upgrade needed', event);
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores as needed
      if (!db.objectStoreNames.contains('workouts')) {
        db.createObjectStore('workouts', { keyPath: 'id', autoIncrement: true });
        console.log('IndexedDB: Created workouts store');
      }
      
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        console.log('IndexedDB: Created pendingSync store');
      }
    };
    
    // Success handler
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB: Database opened successfully');
      resolve(db);
    };
    
    // Error handler
    request.onerror = (event) => {
      console.error('IndexedDB: Error opening database', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Store workout data
export const storeWorkout = async (workoutData: any): Promise<number> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['workouts'], 'readwrite');
    const store = transaction.objectStore('workouts');
    
    // Add the workout data
    const request = store.add(workoutData);
    
    request.onsuccess = (event) => {
      const id = (event.target as IDBRequest).result as number;
      console.log('IndexedDB: Workout stored successfully', id);
      
      // Also add to pendingSync if we're offline
      if (!navigator.onLine) {
        console.log('IndexedDB: Device is offline, adding to sync queue');
        addToPendingSync({ type: 'workout', data: workoutData, id });
      }
      
      resolve(id);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB: Error storing workout', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    // Close the database when transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Get all stored workouts
export const getAllWorkouts = async (): Promise<any[]> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['workouts'], 'readonly');
    const store = transaction.objectStore('workouts');
    
    // Get all items from the store
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      const workouts = (event.target as IDBRequest).result as any[];
      console.log('IndexedDB: Retrieved all workouts', workouts.length);
      resolve(workouts);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB: Error getting workouts', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    // Close the database when transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Add item to pending sync queue
export const addToPendingSync = async (item: any): Promise<number> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    // Add the item to the pending sync store
    const request = store.add({
      ...item,
      timestamp: new Date().toISOString()
    });
    
    request.onsuccess = (event) => {
      const id = (event.target as IDBRequest).result as number;
      console.log('IndexedDB: Added to pending sync queue', id);
      
      // Trigger a sync if supported and we're back online
      if (navigator.onLine && 'serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(registration => {
            // Check if sync is available
            if ('sync' in registration) {
              // Cast to any to avoid TS errors since the SyncManager API is not fully supported in all TypeScript versions
              return (registration as any).sync.register('sync-workouts');
            }
            return Promise.resolve();
          })
          .then(() => console.log('IndexedDB: Sync registered'))
          .catch(err => console.error('IndexedDB: Sync registration failed', err));
      }
      
      resolve(id);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB: Error adding to sync queue', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    // Close the database when transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Get all pending sync items
export const getPendingSyncItems = async (): Promise<any[]> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    
    // Get all items from the store
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      const items = (event.target as IDBRequest).result as any[];
      console.log('IndexedDB: Retrieved pending sync items', items.length);
      resolve(items);
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB: Error getting sync items', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    // Close the database when transaction completes
    transaction.oncomplete = () => db.close();
  });
};

// Remove an item from the pending sync queue
export const removePendingSyncItem = async (id: number): Promise<void> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSync'], 'readwrite');
    const store = transaction.objectStore('pendingSync');
    
    // Delete the item
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log('IndexedDB: Removed sync item', id);
      resolve();
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB: Error removing sync item', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
    
    // Close the database when transaction completes
    transaction.oncomplete = () => db.close();
  });
}; 