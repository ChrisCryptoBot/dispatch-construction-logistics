/**
 * Rate Calculator Service
 * Handles all rate mode calculations for construction logistics
 */

class RateCalculator {
  /**
   * Calculate load pricing based on rate mode and parameters
   */
  async calculateLoadPricing(params) {
    const {
      rateMode,
      rate,
      units,
      miles,
      deadhead,
      commodity,
      loadType,
      dumpFee = 0,
      fuelSurcharge = 0,
      tolls = 0,
      accessorials = {}
    } = params;

    let grossRevenue = 0;
    let calculation = {};

    switch (rateMode) {
      case 'PER_TON':
        grossRevenue = this.calculatePerTon(rate, units, dumpFee, fuelSurcharge);
        calculation = {
          baseRate: rate,
          units,
          unitRevenue: rate * units,
          dumpFee,
          fuelSurcharge,
          grossRevenue
        };
        break;

      case 'PER_YARD':
        grossRevenue = this.calculatePerYard(rate, units, dumpFee, fuelSurcharge);
        calculation = {
          baseRate: rate,
          units,
          unitRevenue: rate * units,
          dumpFee,
          fuelSurcharge,
          grossRevenue
        };
        break;

      case 'PER_MILE':
        grossRevenue = this.calculatePerMile(rate, miles, deadhead, tolls, fuelSurcharge);
        calculation = {
          baseRate: rate,
          miles,
          deadhead,
          totalMiles: miles + (deadhead || 0),
          mileRevenue: rate * (miles + (deadhead || 0)),
          tolls,
          fuelSurcharge,
          grossRevenue
        };
        break;

      case 'PER_TRIP':
        grossRevenue = this.calculatePerTrip(rate, accessorials, fuelSurcharge);
        calculation = {
          baseRate: rate,
          accessorials,
          fuelSurcharge,
          grossRevenue
        };
        break;

      case 'PER_HOUR':
        grossRevenue = this.calculatePerHour(rate, units, fuelSurcharge);
        calculation = {
          baseRate: rate,
          hours: units,
          hourRevenue: rate * units,
          fuelSurcharge,
          grossRevenue
        };
        break;

      case 'PER_LOAD':
        grossRevenue = this.calculatePerLoad(rate, accessorials, fuelSurcharge);
        calculation = {
          baseRate: rate,
          accessorials,
          fuelSurcharge,
          grossRevenue
        };
        break;

      case 'DAILY':
        grossRevenue = this.calculateDaily(rate, units, fuelSurcharge);
        calculation = {
          baseRate: rate,
          days: units,
          dayRevenue: rate * units,
          fuelSurcharge,
          grossRevenue
        };
        break;

      default:
        throw new Error(`Unsupported rate mode: ${rateMode}`);
    }

    // Calculate true rate per mile for comparison
    const trueRatePerMile = this.calculateTrueRatePerMile(grossRevenue, miles, deadhead, tolls, dumpFee);

    return {
      rateMode,
      grossRevenue: Math.round(grossRevenue * 100) / 100, // Round to 2 decimal places
      trueRatePerMile: Math.round(trueRatePerMile * 100) / 100,
      calculation,
      breakdown: this.generateBreakdown(rateMode, calculation)
    };
  }

  /**
   * Calculate Per Ton pricing
   */
  calculatePerTon(rate, tons, dumpFee, fuelSurcharge) {
    return (rate * tons) + dumpFee + fuelSurcharge;
  }

  /**
   * Calculate Per Yard pricing
   */
  calculatePerYard(rate, yards, dumpFee, fuelSurcharge) {
    return (rate * yards) + dumpFee + fuelSurcharge;
  }

  /**
   * Calculate Per Mile pricing
   */
  calculatePerMile(rate, miles, deadhead, tolls, fuelSurcharge) {
    const totalMiles = miles + (deadhead || 0);
    return (rate * totalMiles) + tolls + fuelSurcharge;
  }

  /**
   * Calculate Per Trip pricing
   */
  calculatePerTrip(rate, accessorials, fuelSurcharge) {
    const accessorialTotal = Object.values(accessorials || {}).reduce((sum, value) => sum + (value || 0), 0);
    return rate + accessorialTotal + fuelSurcharge;
  }

  /**
   * Calculate Per Hour pricing
   */
  calculatePerHour(rate, hours, fuelSurcharge) {
    return (rate * hours) + fuelSurcharge;
  }

  /**
   * Calculate Per Load pricing
   */
  calculatePerLoad(rate, accessorials, fuelSurcharge) {
    const accessorialTotal = Object.values(accessorials || {}).reduce((sum, value) => sum + (value || 0), 0);
    return rate + accessorialTotal + fuelSurcharge;
  }

  /**
   * Calculate Daily pricing
   */
  calculateDaily(rate, days, fuelSurcharge) {
    return (rate * days) + fuelSurcharge;
  }

  /**
   * Calculate true rate per mile for comparison
   */
  calculateTrueRatePerMile(grossRevenue, miles, deadhead, tolls, dumpFee) {
    const totalMiles = miles + (deadhead || 0);
    if (totalMiles === 0) return 0;
    
    return (grossRevenue - tolls - dumpFee) / totalMiles;
  }

  /**
   * Generate pricing breakdown for display
   */
  generateBreakdown(rateMode, calculation) {
    const breakdown = [];

    switch (rateMode) {
      case 'PER_TON':
        breakdown.push(`${calculation.baseRate} × ${calculation.units} tons = $${calculation.unitRevenue}`);
        if (calculation.dumpFee > 0) breakdown.push(`Dump fee: $${calculation.dumpFee}`);
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;

      case 'PER_YARD':
        breakdown.push(`${calculation.baseRate} × ${calculation.units} yards = $${calculation.unitRevenue}`);
        if (calculation.dumpFee > 0) breakdown.push(`Dump fee: $${calculation.dumpFee}`);
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;

      case 'PER_MILE':
        breakdown.push(`${calculation.baseRate} × ${calculation.totalMiles} miles = $${calculation.mileRevenue}`);
        if (calculation.tolls > 0) breakdown.push(`Tolls: $${calculation.tolls}`);
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;

      case 'PER_TRIP':
        breakdown.push(`Base rate: $${calculation.baseRate}`);
        if (Object.keys(calculation.accessorials || {}).length > 0) {
          Object.entries(calculation.accessorials).forEach(([key, value]) => {
            if (value > 0) breakdown.push(`${key}: $${value}`);
          });
        }
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;

      case 'PER_HOUR':
        breakdown.push(`${calculation.baseRate} × ${calculation.hours} hours = $${calculation.hourRevenue}`);
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;

      case 'PER_LOAD':
        breakdown.push(`Base rate: $${calculation.baseRate}`);
        if (Object.keys(calculation.accessorials || {}).length > 0) {
          Object.entries(calculation.accessorials).forEach(([key, value]) => {
            if (value > 0) breakdown.push(`${key}: $${value}`);
          });
        }
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;

      case 'DAILY':
        breakdown.push(`${calculation.baseRate} × ${calculation.days} days = $${calculation.dayRevenue}`);
        if (calculation.fuelSurcharge > 0) breakdown.push(`Fuel surcharge: $${calculation.fuelSurcharge}`);
        break;
    }

    return breakdown;
  }

  /**
   * Suggest rate based on commodity and haul type
   */
  suggestRate(commodity, haulType, distance) {
    const suggestions = {
      // Metro rates (per ton/yard)
      'aggregates': { PER_TON: 8, PER_YARD: 12 },
      'dirt': { PER_TON: 6, PER_YARD: 10 },
      'gravel': { PER_TON: 7, PER_YARD: 11 },
      'concrete': { PER_YARD: 15 },
      
      // Regional rates (per mile)
      'equipment': { PER_MILE: 2.50 },
      'materials': { PER_MILE: 2.00 },
      
      // OTR rates (per mile)
      'freight': { PER_MILE: 1.80 },
      'long_haul': { PER_MILE: 1.60 }
    };

    const commodityLower = commodity.toLowerCase();
    const baseRates = suggestions[commodityLower] || {};

    // Adjust for haul type
    let multiplier = 1.0;
    switch (haulType) {
      case 'METRO':
        multiplier = 1.0;
        break;
      case 'REGIONAL':
        multiplier = 0.8;
        break;
      case 'OTR':
        multiplier = 0.6;
        break;
    }

    // Adjust for distance
    if (distance > 200) {
      multiplier *= 0.9; // Volume discount for long hauls
    }

    const adjustedRates = {};
    Object.entries(baseRates).forEach(([mode, rate]) => {
      adjustedRates[mode] = Math.round(rate * multiplier * 100) / 100;
    });

    return adjustedRates;
  }

  /**
   * Validate rate reasonableness
   */
  validateRate(rateMode, rate, commodity, haulType, distance) {
    const warnings = [];
    const errors = [];

    // Get suggested rates for comparison
    const suggestions = this.suggestRate(commodity, haulType, distance);
    const suggestedRate = suggestions[rateMode];

    if (suggestedRate) {
      const variance = Math.abs(rate - suggestedRate) / suggestedRate;
      
      if (variance > 0.5) {
        warnings.push(`Rate $${rate} is ${Math.round(variance * 100)}% different from suggested $${suggestedRate}`);
      }

      if (rate < suggestedRate * 0.5) {
        warnings.push(`Rate $${rate} seems unusually low compared to suggested $${suggestedRate}`);
      }

      if (rate > suggestedRate * 2) {
        warnings.push(`Rate $${rate} seems unusually high compared to suggested $${suggestedRate}`);
      }
    }

    // Check for negative rates
    if (rate < 0) {
      errors.push('Rate cannot be negative');
    }

    // Check for extremely high rates
    if (rate > 1000) {
      warnings.push(`Rate $${rate} is extremely high - verify this is correct`);
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      suggestions
    };
  }
}

const rateCalculator = new RateCalculator();

module.exports = { rateCalculator };

