const { prisma } = require('../../db/prisma');

class EquipmentMatcher {
  /**
   * Main matching logic - determines optimal equipment for a commodity
   */
  async matchEquipment(request) {
    const { commodity, equipmentOverride, overrideReason, loadType, haulType } = request;

    // If equipment is explicitly overridden, handle it
    if (equipmentOverride) {
      return this.handleEquipmentOverride(equipmentOverride, overrideReason || '');
    }

    // Get all equipment types from database
    const equipmentTypes = await prisma.equipmentType.findMany({
      where: { active: true }
    });

    // Find optimal matches
    const optimalMatches = this.findOptimalMatches(commodity, equipmentTypes, loadType, haulType);
    
    if (optimalMatches.length > 0) {
      const bestMatch = optimalMatches[0];
      return {
        tier: 'optimal',
        equipmentType: bestMatch.name,
        category: bestMatch.category,
        rationale: `Optimal equipment for ${commodity} - ${bestMatch.category} designed for this commodity type`
      };
    }

    // Find acceptable alternatives
    const acceptableMatches = this.findAcceptableMatches(commodity, equipmentTypes, loadType, haulType);
    
    if (acceptableMatches.length > 0) {
      const bestMatch = acceptableMatches[0];
      return {
        tier: 'acceptable',
        equipmentType: bestMatch.name,
        category: bestMatch.category,
        rationale: `Acceptable alternative for ${commodity} - ${bestMatch.category} can handle this load with minor efficiency loss`
      };
    }

    // Check for unusual but possible matches
    const unusualMatches = this.findUnusualMatches(commodity, equipmentTypes, loadType, haulType);
    
    if (unusualMatches.length > 0) {
      const bestMatch = unusualMatches[0];
      return {
        tier: 'unusual',
        equipmentType: bestMatch.name,
        category: bestMatch.category,
        rationale: `Unusual equipment choice for ${commodity} - ${bestMatch.category} requires special handling and confirmation`,
        overrideRequired: true,
        overrideReason: `Using ${bestMatch.name} for ${commodity} is unusual and requires dispatcher approval`
      };
    }

    // No suitable equipment found
    return {
      tier: 'hard_block',
      equipmentType: 'NONE',
      category: 'NONE',
      rationale: `No suitable equipment found for ${commodity} - this load cannot be safely transported with available equipment types`
    };
  }

  /**
   * Handle explicit equipment overrides with validation
   */
  async handleEquipmentOverride(equipmentName, reason) {
    const equipment = await prisma.equipmentType.findUnique({
      where: { name: equipmentName }
    });

    if (!equipment) {
      return {
        tier: 'hard_block',
        equipmentType: 'INVALID',
        category: 'NONE',
        rationale: `Equipment "${equipmentName}" not found in system`
      };
    }

    return {
      tier: 'unusual',
      equipmentType: equipment.name,
      category: equipment.category,
      rationale: `Manual override: ${equipment.name} selected by dispatcher`,
      overrideRequired: true,
      overrideReason: reason || 'Manual equipment override'
    };
  }

  /**
   * Find optimal equipment matches based on commodity and load characteristics
   */
  findOptimalMatches(commodity, equipmentTypes, loadType, haulType) {
    const commodityLower = commodity.toLowerCase();
    
    return equipmentTypes.filter(equipment => {
      const optimalFor = equipment.optimalFor || [];
      
      // Direct commodity match
      if (optimalFor.some((item) => item.toLowerCase() === commodityLower)) {
        return true;
      }

      // Load type specific matching
      if (loadType === 'AGGREGATE' && equipment.category === 'dump_truck') {
        return optimalFor.some((item) => 
          ['aggregates', 'dirt', 'gravel', 'sand'].includes(item.toLowerCase())
        );
      }

      if (loadType === 'EQUIPMENT' && equipment.category === 'lowboy') {
        return optimalFor.some((item) => 
          ['heavy_equipment', 'excavators', 'dozers'].includes(item.toLowerCase())
        );
      }

      if (loadType === 'MATERIAL' && equipment.category === 'flatbed') {
        return optimalFor.some((item) => 
          ['steel', 'lumber', 'pipe', 'rebar'].includes(item.toLowerCase())
        );
      }

      return false;
    }).sort((a, b) => {
      // Prioritize by category preference
      const categoryPriority = { 'dump_truck': 1, 'mixer': 2, 'flatbed': 3, 'lowboy': 4 };
      return (categoryPriority[a.category] || 5) - (categoryPriority[b.category] || 5);
    });
  }

  /**
   * Find acceptable alternative equipment
   */
  findAcceptableMatches(commodity, equipmentTypes, loadType, haulType) {
    const commodityLower = commodity.toLowerCase();
    
    return equipmentTypes.filter(equipment => {
      const acceptableFor = equipment.acceptableFor || [];
      
      // Check acceptable alternatives
      if (acceptableFor.some((item) => item.toLowerCase() === commodityLower)) {
        return true;
      }

      // Cross-category acceptable matches
      if (loadType === 'AGGREGATE' && ['transfer_dump', 'belly_dump'].includes(equipment.name.toLowerCase())) {
        return true;
      }

      if (loadType === 'MATERIAL' && equipment.category === 'flatbed') {
        return true; // Most flatbeds can handle general materials
      }

      return false;
    });
  }

  /**
   * Find unusual but technically possible equipment matches
   */
  findUnusualMatches(commodity, equipmentTypes, loadType, haulType) {
    const commodityLower = commodity.toLowerCase();
    
    return equipmentTypes.filter(equipment => {
      // Unusual but possible combinations
      if (loadType === 'AGGREGATE' && equipment.category === 'flatbed') {
        return true; // Unusual but possible with proper containment
      }

      if (loadType === 'EQUIPMENT' && equipment.category === 'dump_truck') {
        return true; // Very unusual but technically possible for small equipment
      }

      if (commodityLower.includes('concrete') && equipment.category === 'dump_truck') {
        return true; // Unusual for concrete but possible
      }

      return false;
    });
  }

  /**
   * Get equipment suggestions for a commodity (for UI dropdowns)
   */
  async getEquipmentSuggestions(commodity) {
    const equipmentTypes = await prisma.equipmentType.findMany({
      where: { active: true }
    });

    const optimal = this.findOptimalMatches(commodity, equipmentTypes);
    const acceptable = this.findAcceptableMatches(commodity, equipmentTypes);
    const unusual = this.findUnusualMatches(commodity, equipmentTypes);

    return { optimal, acceptable, unusual };
  }

  /**
   * Validate equipment-commodity combination for compliance
   */
  async validateEquipmentCompliance(equipmentName, commodity, loadType) {
    const warnings = [];
    const errors = [];

    const equipment = await prisma.equipmentType.findUnique({
      where: { name: equipmentName }
    });

    if (!equipment) {
      errors.push(`Equipment "${equipmentName}" not found`);
      return { valid: false, warnings, errors };
    }

    // Check for hard blocks
    if (loadType === 'HAZMAT' && !equipment.optimalFor?.includes('hazmat')) {
      errors.push(`${equipment.name} is not certified for hazmat transport`);
    }

    if (loadType === 'FOOD_GRADE' && equipment.category === 'dump_truck') {
      errors.push(`${equipment.name} cannot be used for food-grade materials`);
    }

    // Check for warnings
    if (loadType === 'AGGREGATE' && equipment.category === 'flatbed') {
      warnings.push(`${equipment.name} is unusual for aggregates - ensure proper containment`);
    }

    if (loadType === 'EQUIPMENT' && equipment.category === 'dump_truck') {
      warnings.push(`${equipment.name} is unusual for equipment transport - verify weight limits`);
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }
}

const equipmentMatcher = new EquipmentMatcher();

module.exports = { equipmentMatcher };

