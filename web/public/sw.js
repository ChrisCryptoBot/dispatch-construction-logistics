// Service Worker for Superior One Logistics PWA
const CACHE_NAME = 's1-logistics-v1.0.0'
const STATIC_CACHE = 's1-static-v1.0.0'
const DYNAMIC_CACHE = 's1-dynamic-v1.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/loads',
  '/api/fleet',
  '/api/analytics',
  '/api/drivers'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Serve from cache when offline
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Return offline fallback for API requests
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'This data is not available offline'
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            })
        })
    )
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cache successful responses
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone)
              })

            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'load-creation') {
    event.waitUntil(syncLoadCreation())
  } else if (event.tag === 'status-update') {
    event.waitUntil(syncStatusUpdate())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Superior One Logistics',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Superior One Logistics', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/carrier-dashboard')
    )
  }
})

// Helper functions for background sync
async function syncLoadCreation() {
  try {
    // Get pending load creation data from IndexedDB
    const pendingData = await getPendingData('load-creation')
    
    for (const data of pendingData) {
      try {
        const response = await fetch('/api/loads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify(data.payload)
        })

        if (response.ok) {
          // Remove from pending queue
          await removePendingData('load-creation', data.id)
          console.log('Service Worker: Load creation synced successfully')
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync load creation', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error', error)
  }
}

async function syncStatusUpdate() {
  try {
    // Get pending status updates from IndexedDB
    const pendingData = await getPendingData('status-update')
    
    for (const data of pendingData) {
      try {
        const response = await fetch(`/api/loads/${data.loadId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify(data.payload)
        })

        if (response.ok) {
          // Remove from pending queue
          await removePendingData('status-update', data.id)
          console.log('Service Worker: Status update synced successfully')
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync status update', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync error', error)
  }
}

// IndexedDB helpers (simplified)
async function getPendingData(type) {
  // In a real implementation, you'd use IndexedDB
  // For now, return empty array
  return []
}

async function removePendingData(type, id) {
  // In a real implementation, you'd remove from IndexedDB
  console.log(`Service Worker: Removed pending ${type} data with id ${id}`)
}
