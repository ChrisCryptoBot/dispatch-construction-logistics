const { prisma } = require('../db/prisma');

/**
 * GPS Tracking Service
 * Manages GPS events and auto-updates load status based on location
 */

const GEOFENCE_RADIUS_METERS = 500; // 500 meters (~0.3 miles)

/**
 * Ingest GPS location and auto-update load status
 * @param {string} loadId - Load ID
 * @param {string} driverId - Driver user ID
 * @param {Object} location - GPS data
 * @returns {Promise<Object>} GPS event and status update result
 */
async function ingestGPSLocation(loadId, driverId, location) {
  const { latitude, longitude, stage, source = 'manual' } = location;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: {
      id: true,
      status: true,
      origin: true,
      destination: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  // Create GPS event
  const geoEvent = await prisma.geoEvent.create({
    data: {
      loadId,
      driverId,
      stage,
      latitude,
      longitude,
      source
    }
  });

  // Auto-update load status based on stage and proximity
  let statusUpdated = false;
  let newStatus = load.status;

  if (stage === 'at_pickup' && load.status === 'RELEASED') {
    // Verify proximity to pickup location
    const origin = typeof load.origin === 'string' ? JSON.parse(load.origin) : load.origin;
    const pickupLat = origin.lat || origin.latitude;
    const pickupLon = origin.lng || origin.longitude;

    if (pickupLat && pickupLon) {
      const distance = calculateDistanceMeters(latitude, longitude, pickupLat, pickupLon);
      
      if (distance <= GEOFENCE_RADIUS_METERS) {
        // Within pickup geofence, update to IN_TRANSIT
        await prisma.load.update({
          where: { id: loadId },
          data: {
            status: 'IN_TRANSIT',
            pickupEta: new Date() // Actual pickup time
          }
        });
        statusUpdated = true;
        newStatus = 'IN_TRANSIT';
      }
    }
  }

  if (stage === 'at_delivery' && load.status === 'IN_TRANSIT') {
    // Verify proximity to delivery location
    const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
    const deliveryLat = destination.lat || destination.latitude;
    const deliveryLon = destination.lng || destination.longitude;

    if (deliveryLat && deliveryLon) {
      const distance = calculateDistanceMeters(latitude, longitude, deliveryLat, deliveryLon);
      
      if (distance <= GEOFENCE_RADIUS_METERS) {
        // Within delivery geofence, update to DELIVERED
        await prisma.load.update({
          where: { id: loadId },
          data: {
            status: 'DELIVERED',
            deliveryEta: new Date() // Actual delivery time
          }
        });
        statusUpdated = true;
        newStatus = 'DELIVERED';
      }
    }
  }

  return {
    geoEvent,
    statusUpdated,
    newStatus,
    message: statusUpdated ? `Load status updated to ${newStatus}` : 'GPS location recorded'
  };
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in meters
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate ETA to destination based on current location
 * @param {string} loadId - Load ID
 * @param {Object} currentLocation - Current GPS coordinates
 * @returns {Promise<Object>} ETA calculation
 */
async function calculateETA(loadId, currentLocation) {
  const { latitude, longitude } = currentLocation;

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    select: {
      destination: true,
      status: true
    }
  });

  if (!load) {
    throw new Error('LOAD_NOT_FOUND');
  }

  const destination = typeof load.destination === 'string' ? JSON.parse(load.destination) : load.destination;
  const destLat = destination.lat || destination.latitude;
  const destLon = destination.lng || destination.longitude;

  if (!destLat || !destLon) {
    return {
      eta: null,
      message: 'Destination coordinates not available'
    };
  }

  // Calculate distance
  const distanceMeters = calculateDistanceMeters(latitude, longitude, destLat, destLon);
  const distanceMiles = distanceMeters / 1609.34;

  // Simple ETA calculation (assumes 30 mph average speed)
  const avgSpeedMph = 30;
  const hoursToDestination = distanceMiles / avgSpeedMph;
  const minutesToDestination = Math.round(hoursToDestination * 60);

  const eta = new Date(Date.now() + minutesToDestination * 60 * 1000);

  return {
    eta,
    distanceRemaining: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
    estimatedMinutes: minutesToDestination,
    currentLocation: {
      latitude,
      longitude
    }
  };
}

/**
 * Get GPS tracking history for load
 * @param {string} loadId - Load ID
 * @returns {Promise<Array>} GPS events
 */
async function getTrackingHistory(loadId) {
  const events = await prisma.geoEvent.findMany({
    where: { loadId },
    include: {
      driver: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return events;
}

module.exports = {
  ingestGPSLocation,
  calculateETA,
  getTrackingHistory,
  calculateDistanceMeters,
  GEOFENCE_RADIUS_METERS
};

