/**
 * Pricing Engine for Construction Hauling
 * 
 * Calculates per-ton rates based on commodity, equipment, distance, and project specifics
 * Uses the battle-tested construction formula for dump trucks and market rates for specialized equipment
 */

// Equipment types and their characteristics
export const equipmentTypes = {
  // Dump Trucks (Per-Ton Pricing)
  'tri_axle_dump': {
    name: 'Tri-Axle Dump',
    category: 'dump',
    capacity: 18, // tons
    baseRatePerTonMile: 0.36,
    emptyMileRate: 2.00,
    hourlyStandbyRate: 135,
    mobilizationBase: 120,
    gracePeriodMinutes: 15,
    commodities: ['aggregates', 'sand', 'gravel', 'crushed_stone', 'fill_dirt', 'topsoil']
  },
  'end_dump': {
    name: 'End Dump',
    category: 'dump',
    capacity: 22,
    baseRatePerTonMile: 0.38,
    emptyMileRate: 2.25,
    hourlyStandbyRate: 145,
    mobilizationBase: 150,
    gracePeriodMinutes: 15,
    commodities: ['asphalt', 'hot_mix', 'aggregates', 'coal', 'salt']
  },
  'side_dump': {
    name: 'Side Dump',
    category: 'dump',
    capacity: 20,
    baseRatePerTonMile: 0.37,
    emptyMileRate: 2.15,
    hourlyStandbyRate: 140,
    mobilizationBase: 135,
    gracePeriodMinutes: 15,
    commodities: ['fill_dirt', 'topsoil', 'mulch', 'aggregates']
  },
  'belly_dump': {
    name: 'Belly Dump',
    category: 'dump',
    capacity: 24,
    baseRatePerTonMile: 0.40,
    emptyMileRate: 2.50,
    hourlyStandbyRate: 155,
    mobilizationBase: 175,
    gracePeriodMinutes: 15,
    commodities: ['coal', 'aggregates', 'salt', 'sand']
  },
  'super_dump': {
    name: 'Super Dump',
    category: 'dump',
    capacity: 26,
    baseRatePerTonMile: 0.42,
    emptyMileRate: 2.75,
    hourlyStandbyRate: 165,
    mobilizationBase: 200,
    gracePeriodMinutes: 20,
    commodities: ['aggregates', 'crushed_stone', 'asphalt']
  },
  
  // Specialized Equipment (Per-Mile or Per-Load Pricing)
  'flatbed': {
    name: 'Flatbed',
    category: 'specialized',
    capacity: 25, // tons
    baseRatePerMile: 2.50,
    minRate: 450,
    commodities: ['steel', 'lumber', 'building_materials', 'equipment', 'pipes']
  },
  'step_deck': {
    name: 'Step Deck',
    category: 'specialized',
    capacity: 24,
    baseRatePerMile: 2.75,
    minRate: 500,
    commodities: ['equipment', 'machinery', 'building_materials']
  },
  'lowboy': {
    name: 'Lowboy',
    category: 'specialized',
    capacity: 40,
    baseRatePerMile: 3.50,
    minRate: 750,
    commodities: ['heavy_equipment', 'excavators', 'bulldozers']
  },
  'double_drop': {
    name: 'Double Drop',
    category: 'specialized',
    capacity: 45,
    baseRatePerMile: 3.75,
    minRate: 850,
    commodities: ['heavy_equipment', 'industrial_machinery']
  },
  'pneumatic': {
    name: 'Pneumatic Tank',
    category: 'specialized',
    capacity: 28,
    baseRatePerMile: 2.85,
    minRate: 550,
    commodities: ['cement', 'fly_ash', 'lime']
  }
}

// Commodity definitions
export const commodities = {
  // Aggregates & Stone
  'aggregates': { name: 'Aggregates (Crushed Stone, Gravel)', preferredEquipment: ['tri_axle_dump', 'end_dump', 'super_dump'] },
  'crushed_stone': { name: 'Crushed Stone', preferredEquipment: ['tri_axle_dump', 'super_dump'] },
  'sand': { name: 'Sand', preferredEquipment: ['tri_axle_dump', 'belly_dump'] },
  'gravel': { name: 'Gravel', preferredEquipment: ['tri_axle_dump', 'end_dump'] },
  
  // Asphalt & Paving
  'asphalt': { name: 'Asphalt', preferredEquipment: ['end_dump'] },
  'hot_mix': { name: 'Hot Mix Asphalt', preferredEquipment: ['end_dump'] },
  
  // Ready-Mix
  'ready_mix': { name: 'Ready-Mix Concrete', preferredEquipment: ['tri_axle_dump'], note: 'Requires mixer truck' },
  
  // Soil & Fill
  'fill_dirt': { name: 'Fill Dirt', preferredEquipment: ['side_dump', 'tri_axle_dump'] },
  'topsoil': { name: 'Topsoil', preferredEquipment: ['side_dump', 'tri_axle_dump'] },
  'mulch': { name: 'Mulch', preferredEquipment: ['side_dump'] },
  
  // Industrial
  'coal': { name: 'Coal', preferredEquipment: ['belly_dump', 'end_dump'] },
  'salt': { name: 'Salt', preferredEquipment: ['belly_dump', 'end_dump'] },
  
  // Building Materials
  'steel': { name: 'Steel Beams & Rebar', preferredEquipment: ['flatbed'] },
  'lumber': { name: 'Lumber & Building Materials', preferredEquipment: ['flatbed'] },
  'building_materials': { name: 'Building Materials', preferredEquipment: ['flatbed', 'step_deck'] },
  'pipes': { name: 'Pipes & Utilities', preferredEquipment: ['flatbed'] },
  
  // Equipment
  'equipment': { name: 'Equipment', preferredEquipment: ['flatbed', 'step_deck', 'lowboy'] },
  'heavy_equipment': { name: 'Heavy Equipment', preferredEquipment: ['lowboy', 'double_drop'] },
  'excavators': { name: 'Excavators', preferredEquipment: ['lowboy'] },
  'bulldozers': { name: 'Bulldozers', preferredEquipment: ['lowboy'] },
  'machinery': { name: 'Machinery', preferredEquipment: ['step_deck', 'lowboy'] },
  'industrial_machinery': { name: 'Industrial Machinery', preferredEquipment: ['double_drop'] },
  
  // Bulk Materials
  'cement': { name: 'Cement (Bulk)', preferredEquipment: ['pneumatic'] },
  'fly_ash': { name: 'Fly Ash', preferredEquipment: ['pneumatic'] },
  'lime': { name: 'Lime', preferredEquipment: ['pneumatic'] },
  
  // Waste & Debris
  'demolition_debris': { name: 'Demolition Debris', preferredEquipment: ['tri_axle_dump', 'end_dump'] },
  'construction_waste': { name: 'Construction Waste', preferredEquipment: ['tri_axle_dump'] }
}

export interface PricingInputs {
  commodity: string
  equipmentType: string
  tons: number
  loadedMiles: number
  emptyMiles: number
  loadDumpMinutes: number // Estimated time for loading + dumping
  expectedQueueMinutes: number // Expected wait time
  numberOfLoads: number
  fuelSurcharge?: number // e.g., 1.05 for 5% surcharge
  disposalFee?: number // per ton
  permitRequired?: boolean
}

export interface PricingResult {
  totalCost: number
  perTonRate: number
  perLoadRate: number
  breakdown: {
    tonMileCost: number
    emptyMileCost: number
    waitTimeCost: number
    mobilizationCost: number
    fuelSurcharge: number
    disposalFees: number
    permitFee: number
  }
  suggestedCustomerRate: number // What to show customer
  suggestedCarrierBidRange: {
    low: number
    mid: number
    high: number
  }
  equipment: typeof equipmentTypes[keyof typeof equipmentTypes]
}

/**
 * Calculate per-ton price using construction formula
 * 
 * Formula: $/ton = [(R_tm × M_L) + (R_E × M_E / P) + (R_hr/60 × max(0, T_LD + T_Q - G) / P) + (F_mob / N×P)] × S_fuel + D
 * 
 * Where:
 * - R_tm = rate per ton-mile (loaded)
 * - M_L = loaded miles
 * - M_E = empty miles
 * - P = payload tons per load
 * - R_E = rate per empty mile
 * - R_hr = hourly standby rate
 * - T_LD = load + dump minutes
 * - T_Q = queue/wait minutes
 * - G = grace minutes before wait billing
 * - F_mob = mobilization cost
 * - N = number of loads
 * - S_fuel = fuel surcharge multiplier
 * - D = disposal per ton
 */
export function calculateDumpTruckPricing(inputs: PricingInputs): PricingResult {
  const equipment = equipmentTypes[inputs.equipmentType as keyof typeof equipmentTypes]
  
  if (!equipment || equipment.category !== 'dump') {
    throw new Error('Invalid dump truck equipment type')
  }
  
  const P = equipment.capacity
  const R_tm = equipment.baseRatePerTonMile
  const R_E = equipment.emptyMileRate
  const R_hr = equipment.hourlyStandbyRate
  const F_mob = equipment.mobilizationBase
  const G = equipment.gracePeriodMinutes
  const S_fuel = inputs.fuelSurcharge || 1.00
  const D = inputs.disposalFee || 0
  
  const M_L = inputs.loadedMiles
  const M_E = inputs.emptyMiles
  const T_LD = inputs.loadDumpMinutes
  const T_Q = inputs.expectedQueueMinutes
  const N = inputs.numberOfLoads
  
  // Calculate each component
  const tonMileCost = R_tm * M_L
  const emptyMileCost = (R_E * M_E) / P
  const waitMinutes = Math.max(0, T_LD + T_Q - G)
  const waitTimeCost = (R_hr / 60) * (waitMinutes / P)
  const mobilizationCost = F_mob / (N * P)
  
  // Base cost per ton
  const baseCostPerTon = (tonMileCost + emptyMileCost + waitTimeCost + mobilizationCost) * S_fuel
  
  // Add disposal
  const perTonRate = baseCostPerTon + D
  
  // Add permit if required (typically $45-75 per load, spread across tons)
  const permitFee = inputs.permitRequired ? (60 / (N * P)) : 0
  const finalPerTonRate = perTonRate + permitFee
  
  // Calculate total cost
  const totalCost = finalPerTonRate * inputs.tons
  const perLoadRate = finalPerTonRate * P
  
  // Suggested customer rate (add 15-20% margin for the platform)
  const suggestedCustomerRate = finalPerTonRate * 1.175 // 17.5% markup
  
  // Suggested carrier bid range (carriers can bid anywhere, but we suggest)
  const suggestedCarrierBidRange = {
    low: finalPerTonRate * 0.95,  // 5% below calculated
    mid: finalPerTonRate,          // Calculated rate
    high: finalPerTonRate * 1.10   // 10% above calculated
  }
  
  return {
    totalCost,
    perTonRate: finalPerTonRate,
    perLoadRate,
    breakdown: {
      tonMileCost: tonMileCost * inputs.tons,
      emptyMileCost: emptyMileCost * inputs.tons,
      waitTimeCost: waitTimeCost * inputs.tons,
      mobilizationCost: mobilizationCost * inputs.tons,
      fuelSurcharge: (baseCostPerTon - (tonMileCost + emptyMileCost + waitTimeCost + mobilizationCost)) * inputs.tons,
      disposalFees: D * inputs.tons,
      permitFee: permitFee * inputs.tons
    },
    suggestedCustomerRate,
    suggestedCarrierBidRange,
    equipment
  }
}

/**
 * Calculate specialized equipment pricing (per-mile basis)
 */
export function calculateSpecializedEquipmentPricing(inputs: PricingInputs): PricingResult {
  const equipment = equipmentTypes[inputs.equipmentType as keyof typeof equipmentTypes]
  
  if (!equipment || equipment.category !== 'specialized') {
    throw new Error('Invalid specialized equipment type')
  }
  
  const baseRate = equipment.baseRatePerMile
  const minRate = equipment.minRate
  const totalMiles = inputs.loadedMiles + inputs.emptyMiles
  const S_fuel = inputs.fuelSurcharge || 1.00
  
  // Calculate base cost
  const baseCost = Math.max(minRate, baseRate * totalMiles)
  const fuelAdjustedCost = baseCost * S_fuel
  
  // Add permit if required
  const permitFee = inputs.permitRequired ? 75 : 0
  const totalCost = fuelAdjustedCost + permitFee
  
  // Per-ton calculation (for display)
  const perTonRate = inputs.tons > 0 ? totalCost / inputs.tons : 0
  const perLoadRate = totalCost
  
  // Suggested rates
  const suggestedCustomerRate = totalCost * 1.20 / (inputs.tons || 1) // 20% markup for specialized
  const suggestedCarrierBidRange = {
    low: totalCost * 0.92 / (inputs.tons || 1),
    mid: totalCost / (inputs.tons || 1),
    high: totalCost * 1.15 / (inputs.tons || 1)
  }
  
  return {
    totalCost,
    perTonRate,
    perLoadRate,
    breakdown: {
      tonMileCost: baseCost,
      emptyMileCost: 0, // Included in per-mile rate
      waitTimeCost: 0,
      mobilizationCost: 0,
      fuelSurcharge: fuelAdjustedCost - baseCost,
      disposalFees: 0,
      permitFee
    },
    suggestedCustomerRate,
    suggestedCarrierBidRange,
    equipment
  }
}

/**
 * Main pricing function - routes to appropriate calculator
 */
export function calculatePricing(inputs: PricingInputs): PricingResult {
  const equipment = equipmentTypes[inputs.equipmentType as keyof typeof equipmentTypes]
  
  if (!equipment) {
    throw new Error('Invalid equipment type')
  }
  
  if (equipment.category === 'dump') {
    return calculateDumpTruckPricing(inputs)
  } else {
    return calculateSpecializedEquipmentPricing(inputs)
  }
}

/**
 * Get recommended equipment for a commodity
 */
export function getRecommendedEquipment(commodityKey: string): string[] {
  const commodity = commodities[commodityKey as keyof typeof commodities]
  return commodity?.preferredEquipment || []
}

/**
 * Get quick estimate (simplified inputs for initial quote)
 */
export function getQuickEstimate(
  commodity: string,
  tons: number,
  miles: number
): { low: number, mid: number, high: number, equipmentOptions: string[] } {
  const recommendedEquipment = getRecommendedEquipment(commodity)
  
  if (recommendedEquipment.length === 0) {
    return { low: 0, mid: 0, high: 0, equipmentOptions: [] }
  }
  
  // Use first recommended equipment for estimate
  const equipmentType = recommendedEquipment[0]
  const equipment = equipmentTypes[equipmentType as keyof typeof equipmentTypes]
  
  // Simplified calculation (assumes 1 load, 50% deadhead, 30 min handling)
  const loads = Math.ceil(tons / equipment.capacity)
  const inputs: PricingInputs = {
    commodity,
    equipmentType,
    tons,
    loadedMiles: miles,
    emptyMiles: miles * 0.5,
    loadDumpMinutes: 30,
    expectedQueueMinutes: 10,
    numberOfLoads: loads
  }
  
  const pricing = calculatePricing(inputs)
  
  return {
    low: pricing.suggestedCarrierBidRange.low * tons,
    mid: pricing.suggestedCustomerRate * tons,
    high: pricing.suggestedCustomerRate * tons * 1.15,
    equipmentOptions: recommendedEquipment
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get market rate context (helpful text for users)
 */
export function getMarketRateContext(equipmentType: string): string {
  const equipment = equipmentTypes[equipmentType as keyof typeof equipmentTypes]
  
  if (!equipment) return ''
  
  if (equipment.category === 'dump') {
    return `Typical range: $${(equipment.baseRatePerTonMile * 10 * 0.9).toFixed(2)}-$${(equipment.baseRatePerTonMile * 10 * 1.15).toFixed(2)}/ton for 10-mile hauls. Rates vary by distance, wait time, and project specifics.`
  } else {
    return `Typical range: $${equipment.minRate}-$${(equipment.baseRatePerMile * 200).toFixed(0)} depending on distance and load specifics.`
  }
}

/**
 * Calculate layover fees based on equipment type and wait time
 */
export const calculateLayoverFee = (equipmentType: string, waitTimeHours: number): number => {
  const equipment = equipmentTypes[equipmentType as keyof typeof equipmentTypes]
  if (!equipment || !equipment.hourlyStandbyRate) {
    return 0
  }
  
  // Calculate layover fee: hourly rate × wait time (rounded up to nearest hour)
  const hours = Math.ceil(waitTimeHours)
  return equipment.hourlyStandbyRate * hours
}

/**
 * Calculate TONU (Truck Order Not Used) fee based on equipment type and distance
 */
export const calculateTONUFee = (equipmentType: string, distance: number): number => {
  const equipment = equipmentTypes[equipmentType as keyof typeof equipmentTypes]
  if (!equipment) {
    return 0
  }
  
  // TONU fee: empty mile rate × distance (minimum 1 hour standby)
  const emptyMiles = Math.max(distance, 1)
  const baseTONU = equipment.emptyMileRate * emptyMiles
  const minimumTONU = equipment.hourlyStandbyRate * 1 // Minimum 1 hour
  
  return Math.max(baseTONU, minimumTONU)
}

/**
 * Get layover fee explanation for customers
 */
export function getLayoverFeeExplanation(equipmentType: string, waitTimeHours: number): string {
  const equipment = equipmentTypes[equipmentType as keyof typeof equipmentTypes]
  if (!equipment) return ''
  
  const fee = calculateLayoverFee(equipmentType, waitTimeHours)
  const hourlyRate = equipment.hourlyStandbyRate
  
  return `Layover fee: $${fee.toFixed(2)} (${hourlyRate}/hour × ${Math.ceil(waitTimeHours)} hours)`
}

/**
 * Get TONU fee explanation for customers
 */
export function getTONUFeeExplanation(equipmentType: string, distance: number): string {
  const equipment = equipmentTypes[equipmentType as keyof typeof equipmentTypes]
  if (!equipment) return ''
  
  const fee = calculateTONUFee(equipmentType, distance)
  const emptyMileRate = equipment.emptyMileRate
  
  return `TONU fee: $${fee.toFixed(2)} (${emptyMileRate}/mile × ${Math.max(distance, 1)} miles + minimum 1 hour standby)`
}
