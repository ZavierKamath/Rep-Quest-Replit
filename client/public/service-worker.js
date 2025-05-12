// Cache names
const CACHE_NAME = 'repquest-tracker-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Database name and version
const DB_NAME = 'repquest-tracker-db';
const DB_VERSION = 1;

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'  // Add offline page to precache
];

// Install event - precache static resources
self.addEventListener('install', event => {
  console.log('Service worker: Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker: Caching app shell and content');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service worker: Activate');
  
  // Remove old caches
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Special handling for API requests
  if (event.request.url.includes('/api/') && event.request.method === 'GET') {
    return event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response for offline use
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fetch fails, try the cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache, return a standard offline message for API
              return new Response(
                JSON.stringify({ 
                  error: 'You are offline. This data will be available when you reconnect.' 
                }),
                { 
                  headers: { 'Content-Type': 'application/json' },
                  status: 503
                }
              );
            });
        })
    );
  }
  
  // Handle regular web requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          }).catch(() => {
            // If fetch fails (e.g., offline), return a fallback response
            console.log('Service worker: Fetch request failed in both cache and network.');
            
            // Return the offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // This is where you might return other fallbacks for other types of requests
            // Example: returning a placeholder image for image requests
            return null;
          });
        });
      })
    );
  }
});

// Add offline sync capabilities
self.addEventListener('sync', event => {
  if (event.tag === 'sync-workouts') {
    console.log('Service worker: Background sync triggered');
    event.waitUntil(syncWorkouts());
  }
});

// Function to handle workout data syncing
async function syncWorkouts() {
  try {
    console.log('Service worker: Starting sync of workout data');
    
    // Open the IndexedDB database
    const dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = event => {
        console.error('Service worker: Error opening IndexedDB', request.error);
        reject(request.error);
      };
      
      request.onsuccess = event => {
        resolve(request.result);
      };
    });
    
    const db = await dbPromise;
    
    // Get items from pendingSync store
    const pendingSyncItems = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    
    console.log(`Service worker: Found ${pendingSyncItems.length} pending items`);
    
    // Process each pending item
    for (const item of pendingSyncItems) {
      if (item.type === 'workout') {
        try {
          // Send to server
          const response = await fetch('/api/workout-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.data)
          });
          
          if (response.ok) {
            console.log(`Service worker: Successfully synced workout with ID ${item.id}`);
            
            // Remove from pendingSync store
            await new Promise((resolve, reject) => {
              const transaction = db.transaction(['pendingSync'], 'readwrite');
              const store = transaction.objectStore('pendingSync');
              const request = store.delete(item.id);
              
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve();
            });
          } else {
            throw new Error(`Server returned status ${response.status}`);
          }
        } catch (error) {
          console.error(`Service worker: Failed to sync workout with ID ${item.id}`, error);
          // Leave in pendingSync for next attempt
        }
      }
    }
    
    console.log('Service worker: Workout data sync complete');
    return true;
  } catch (error) {
    console.error('Service worker: Sync failed', error);
    return false;
  }
} 