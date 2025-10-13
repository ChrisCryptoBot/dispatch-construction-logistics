/**
 * Haul Type Detector Service
 * Determines Metro/Regional/OTR based on distance and suggests appropriate rate modes
 */

class HaulTypeDetector {
  /**
   * Calculate distance between origin and destination
   * This is a simplified version - in production you'd use Google Maps API or similar
   */
  async calculateDistance(origin, destination) {
    // For now, return a mock distance based on coordinates
    // In production, integrate with Google Maps Distance Matrix API
    const originCoords = origin.lat && origin.lng ? { lat: origin.lat, lng: origin.lng } : null;
    const destCoords = destination.lat && destination.lng ? { lat: destination.lat, lng: destination.lng } : null;

    if (originCoords && destCoords) {
      // Calculate straight-line distance (Haversine formula)
      return this.calculateHaversineDistance(originCoords, destCoords);
    }

    // Fallback: estimate based on city/state
    return this.estimateDistanceByLocation(origin, destination);
  }

  /**
   * Detect haul type based on distance
   */
  detectHaulType(distance) {
    if (distance < 50) {
      return 'METRO';
    } else if (distance < 150) {
      return 'REGIONAL';
    } else {
      return 'OTR';
    }
  }

  /**
   * Suggest rate mode based on haul type and commodity
   */
  suggestRateMode(haulType, commodity) {
    const commodityLower = commodity.toLowerCase();

    // Construction commodities typically use PerTon or PerYard
    if (['aggregates', 'dirt', 'gravel', 'sand', 'crushed_stone', 'asphalt'].includes(commodityLower)) {
      return haulType === 'METRO' ? 'PER_TON' : 'PER_TON';
    }

    if (['concrete', 'ready_mix'].includes(commodityLower)) {
      return 'PER_YARD';
    }

    if (['steel', 'lumber', 'pipe', 'rebar'].includes(commodityLower)) {
      return haulType === 'OTR' ? 'PER_MILE' : 'PER_LOAD';
    }

    if (['heavy_equipment', 'excavators', 'dozers', 'cranes'].includes(commodityLower)) {
      return haulType === 'OTR' ? 'PER_MILE' : 'PER_HOUR';
    }

    // Default based on haul type
    switch (haulType) {
      case 'METRO':
        return 'PER_TON';
      case 'REGIONAL':
        return 'PER_MILE';
      case 'OTR':
        return 'PER_MILE';
      default:
        return 'PER_LOAD';
    }
  }

  /**
   * Calculate Haversine distance between two coordinates
   */
  calculateHaversineDistance(coord1, coord2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLon = this.toRadians(coord2.lng - coord1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Estimate distance based on city/state (fallback method)
   */
  estimateDistanceByLocation(origin, destination) {
    // This is a simplified estimation - in production you'd use a geocoding service
    const originCity = origin.city?.toLowerCase() || '';
    const destCity = destination.city?.toLowerCase() || '';
    
    // Same city = metro
    if (originCity === destCity) {
      return Math.floor(Math.random() * 30) + 5; // 5-35 miles
    }

    // Same state = regional
    if (origin.state === destination.state) {
      return Math.floor(Math.random() * 100) + 50; // 50-150 miles
    }

    // Different states = OTR
    return Math.floor(Math.random() * 500) + 200; // 200-700 miles
  }

  /**
   * Get haul type characteristics
   */
  getHaulTypeInfo(haulType) {
    const info = {
      METRO: {
        name: 'Metro',
        description: 'Local city/metro area hauls under 50 miles',
        typicalRateModes: ['PER_TON', 'PER_YARD', 'PER_TRIP'],
        averageDistance: '5-35 miles',
        typicalCommodities: ['aggregates', 'concrete', 'dirt', 'debris'],
        equipment: ['dump_truck', 'mixer', 'transfer_dump']
      },
      REGIONAL: {
        name: 'Regional',
        description: 'Regional hauls 50-150 miles',
        typicalRateModes: ['PER_MILE', 'PER_TON', 'PER_LOAD'],
        averageDistance: '50-150 miles',
        typicalCommodities: ['aggregates', 'equipment', 'materials'],
        equipment: ['dump_truck', 'flatbed', 'lowboy']
      },
      OTR: {
        name: 'Over The Road',
        description: 'Long-haul interstate moves 150+ miles',
        typicalRateModes: ['PER_MILE', 'PER_LOAD'],
        averageDistance: '150+ miles',
        typicalCommodities: ['equipment', 'materials', 'freight'],
        equipment: ['flatbed', 'lowboy', 'van']
      }
    };

    return info[haulType] || null;
  }

  /**
   * Validate haul type and distance combination
   */
  validateHaulType(distance, detectedHaulType) {
    const warnings = [];
    const errors = [];

    // Check for mismatches
    if (distance < 50 && detectedHaulType !== 'METRO') {
      warnings.push(`Distance ${distance}mi suggests METRO haul but detected as ${detectedHaulType}`);
    }

    if (distance >= 50 && distance < 150 && detectedHaulType !== 'REGIONAL') {
      warnings.push(`Distance ${distance}mi suggests REGIONAL haul but detected as ${detectedHaulType}`);
    }

    if (distance >= 150 && detectedHaulType !== 'OTR') {
      warnings.push(`Distance ${distance}mi suggests OTR haul but detected as ${detectedHaulType}`);
    }

    // Check for extreme distances
    if (distance > 1000) {
      warnings.push(`Extreme distance ${distance}mi - verify this is correct`);
    }

    if (distance < 1) {
      errors.push(`Invalid distance ${distance}mi - must be at least 1 mile`);
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }
}

const haulTypeDetector = new HaulTypeDetector();

module.exports = { haulTypeDetector };

