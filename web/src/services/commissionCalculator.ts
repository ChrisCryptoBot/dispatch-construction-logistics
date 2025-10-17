/**
 * Superior One Logistics Commission Calculator
 * Based on transparent pricing model with clamp function for min/max fees
 */

export interface LoadDetails {
  linehaul: number
  fuelSurcharge?: number
  passThroughsTotal?: number
  carrierDeductions?: number
  includeFuelInCommission?: boolean
  commissionPct?: number
  minFee?: number
  capFee?: number
  settlementFeeFlat?: number
  quickPayTerm?: 'T+1' | 'Net-7' | 'Net-30' | 'none'
}

export interface CommissionResult {
  commission: number
  settlementFee: number
  shipperInvoice: number
  carrierPayout: number
  carrierPayoutWithQuickPay: number
  quickPayDiscount: number
  eligibleRevenue: number
}

/**
 * Calculate commission using clamp function: min(max(commission, minFee), capFee)
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Get QuickPay discount rate based on term
 */
function getQuickPayRate(term: string): number {
  switch (term) {
    case 'T+1': return 0.0225  // 2.25%
    case 'Net-7': return 0.0125  // 1.25%
    case 'Net-30': return 0.0075  // 0.75%
    default: return 0
  }
}

/**
 * Calculate commission and payout details for a load
 */
export function calcCommission(load: LoadDetails): CommissionResult {
  // Default values
  const defaults = {
    commissionPct: 0.06,  // 6% default
    minFee: 25,           // $25 minimum
    capFee: 150,          // $150 maximum
    settlementFeeFlat: 10, // $10 settlement fee
    includeFuelInCommission: false,
    passThroughsTotal: 0,
    carrierDeductions: 0,
    fuelSurcharge: 0
  }

  // Merge with defaults
  const config = { ...defaults, ...load }

  // Calculate eligible revenue (linehaul + optional fuel surcharge)
  const eligibleRevenue = config.linehaul + 
    (config.includeFuelInCommission ? (config.fuelSurcharge || 0) : 0)

  // Calculate raw commission
  const rawCommission = config.commissionPct * eligibleRevenue

  // Apply clamp function for min/max fees
  const commission = clamp(rawCommission, config.minFee, config.capFee)

  // Calculate settlement fee
  const settlementFee = config.settlementFeeFlat

  // Calculate shipper invoice
  const shipperInvoice = config.linehaul + 
    config.passThroughsTotal + 
    commission + 
    settlementFee

  // Calculate carrier payout before QuickPay
  const carrierBeforeQuickPay = config.linehaul - 
    commission - 
    config.carrierDeductions

  // Calculate QuickPay discount
  const quickPayDiscountRate = getQuickPayRate(config.quickPayTerm || 'none')
  const quickPayDiscount = carrierBeforeQuickPay * quickPayDiscountRate

  // Calculate final carrier payout
  const carrierPayoutWithQuickPay = carrierBeforeQuickPay - quickPayDiscount

  return {
    commission: Math.round(commission * 100) / 100,
    settlementFee,
    shipperInvoice: Math.round(shipperInvoice * 100) / 100,
    carrierPayout: Math.round(carrierBeforeQuickPay * 100) / 100,
    carrierPayoutWithQuickPay: Math.round(carrierPayoutWithQuickPay * 100) / 100,
    quickPayDiscount: Math.round(quickPayDiscount * 100) / 100,
    eligibleRevenue: Math.round(eligibleRevenue * 100) / 100
  }
}

/**
 * Example calculations for different load types
 */
export const exampleCalculations = {
  smallShuttle: calcCommission({
    linehaul: 300,
    passThroughsTotal: 60,
    commissionPct: 0.06,
    quickPayTerm: 'T+1'
  }),

  largeMove: calcCommission({
    linehaul: 2800,
    passThroughsTotal: 0,
    commissionPct: 0.06,
    quickPayTerm: 'none'
  }),

  volumeDiscount: calcCommission({
    linehaul: 5000,
    passThroughsTotal: 200,
    commissionPct: 0.04, // Enterprise rate
    quickPayTerm: 'Net-7'
  }),

  specializedLoad: calcCommission({
    linehaul: 1200,
    passThroughsTotal: 150,
    commissionPct: 0.08, // Specialized rate
    quickPayTerm: 'T+1'
  })
}

/**
 * Commission rate recommendations based on load type
 */
export const commissionRates = {
  standard: 0.06,      // 6% - Standard construction loads
  specialized: 0.08,   // 8% - Specialized equipment, OTR
  volume: 0.04,        // 4% - High volume, committed lanes
  spot: 0.08          // 8% - Ad-hoc, last-minute loads
}

/**
 * Get recommended commission rate based on load characteristics
 */
export function getRecommendedRate(load: {
  isSpecialized?: boolean
  isVolume?: boolean
  isSpot?: boolean
  isCommitted?: boolean
}): number {
  if (load.isVolume && load.isCommitted) return commissionRates.volume
  if (load.isSpecialized || load.isSpot) return commissionRates.specialized
  return commissionRates.standard
}












