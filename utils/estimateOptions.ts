import { Estimate, EstimateBreakdown, DamageAssessment, DetectedDamage } from '@/types';

/**
 * Multiple Estimate Options System
 * Generates Basic, OEM, and Premium repair estimates
 */

export type EstimateTier = 'basic' | 'oem' | 'premium';

export interface EstimateOption {
  tier: EstimateTier;
  title: string;
  description: string;
  breakdown: EstimateBreakdown;
  total: number;
  features: string[];
  savings?: number; // Compared to OEM
  warranty: string;
  timelineEstimate: string;
  recommended?: boolean;
  popularChoice?: boolean;
}

export interface EstimateComparison {
  basic: EstimateOption;
  oem: EstimateOption;
  premium: EstimateOption;
}

/**
 * Calculate multipliers for different tiers
 */
const TIER_MULTIPLIERS = {
  basic: {
    parts: 0.65,      // Aftermarket parts (35% cheaper)
    labor: 0.9,       // Standard labor rate
    paint: 0.85,      // Standard paint
    supplies: 1.0,    // Same supplies
  },
  oem: {
    parts: 1.0,       // OEM parts (baseline)
    labor: 1.0,       // Standard labor rate
    paint: 1.0,       // Standard paint
    supplies: 1.0,    // Standard supplies
  },
  premium: {
    parts: 1.0,       // OEM parts
    labor: 1.15,      // Premium labor (certified technicians)
    paint: 1.3,       // Premium paint (multi-stage, ceramic coat)
    supplies: 1.1,    // Premium materials
  },
};

/**
 * Generate multiple estimate options from damage assessment
 */
export function generateEstimateOptions(
  damageAssessment: DamageAssessment,
  baseCosts?: {
    parts: number;
    labor: number;
    paint: number;
    shopSupplies: number;
  }
): EstimateComparison {
  // If baseCosts not provided, calculate from damage
  const costs = baseCosts || calculateBaseCosts(damageAssessment);

  // Generate each tier
  const basic = generateBasicEstimate(costs);
  const oem = generateOEMEstimate(costs);
  const premium = generatePremiumEstimate(costs, oem.total);

  return { basic, oem, premium };
}

/**
 * Calculate base costs from damage assessment
 */
function calculateBaseCosts(damageAssessment: DamageAssessment): {
  parts: number;
  labor: number;
  paint: number;
  shopSupplies: number;
} {
  let parts = 0;
  let labor = 0;
  let paint = 0;

  damageAssessment.detectedDamages.forEach((damage: DetectedDamage) => {
    const damageCosts = estimateDamageCost(damage);
    parts += damageCosts.parts;
    labor += damageCosts.labor;
    paint += damageCosts.paint;
  });

  const shopSupplies = (parts + labor + paint) * 0.08; // 8% of subtotal

  return { parts, labor, paint, shopSupplies };
}

/**
 * Estimate cost for individual damage
 */
function estimateDamageCost(damage: DetectedDamage): {
  parts: number;
  labor: number;
  paint: number;
} {
  // Base costs by damage area (simplified - in production would use database)
  const baseCosts: Record<string, { parts: number; labor: number; paint: number }> = {
    front_bumper: { parts: 400, labor: 300, paint: 250 },
    hood: { parts: 500, labor: 250, paint: 350 },
    fender_left: { parts: 350, labor: 250, paint: 300 },
    fender_right: { parts: 350, labor: 250, paint: 300 },
    door_front_left: { parts: 450, labor: 300, paint: 300 },
    door_front_right: { parts: 450, labor: 300, paint: 300 },
    door_rear_left: { parts: 450, labor: 300, paint: 300 },
    door_rear_right: { parts: 450, labor: 300, paint: 300 },
    quarter_panel_left: { parts: 600, labor: 400, paint: 400 },
    quarter_panel_right: { parts: 600, labor: 400, paint: 400 },
    rear_bumper: { parts: 400, labor: 300, paint: 250 },
    trunk: { parts: 500, labor: 250, paint: 350 },
    roof: { parts: 1200, labor: 600, paint: 500 },
    windshield: { parts: 350, labor: 150, paint: 0 },
    headlight_left: { parts: 400, labor: 100, paint: 0 },
    headlight_right: { parts: 400, labor: 100, paint: 0 },
    taillight_left: { parts: 250, labor: 75, paint: 0 },
    taillight_right: { parts: 250, labor: 75, paint: 0 },
  };

  const base = baseCosts[damage.area] || { parts: 300, labor: 200, paint: 200 };

  // Severity multiplier
  const severityMult = damage.severity === 'severe' ? 1.5 : damage.severity === 'moderate' ? 1.0 : 0.7;

  // Replace vs repair
  const repairMult = damage.repairType === 'replace' ? 1.3 : 1.0;

  return {
    parts: base.parts * severityMult * repairMult,
    labor: base.labor * severityMult,
    paint: base.paint * severityMult,
  };
}

/**
 * Generate Basic (Aftermarket) estimate
 */
function generateBasicEstimate(baseCosts: {
  parts: number;
  labor: number;
  paint: number;
  shopSupplies: number;
}): EstimateOption {
  const mult = TIER_MULTIPLIERS.basic;

  const parts = baseCosts.parts * mult.parts;
  const labor = baseCosts.labor * mult.labor;
  const paint = baseCosts.paint * mult.paint;
  const shopSupplies = baseCosts.shopSupplies * mult.supplies;
  const subtotal = parts + labor + paint + shopSupplies;
  const tax = subtotal * 0.08; // 8% tax
  const total = Math.round((subtotal + tax) / 10) * 10; // Round to nearest $10

  return {
    tier: 'basic',
    title: 'Basic Repair',
    description: 'Quality aftermarket parts with standard repair process',
    breakdown: {
      parts: Math.round(parts),
      labor: Math.round(labor),
      paint: Math.round(paint),
      shopSupplies: Math.round(shopSupplies),
      tax: Math.round(tax),
      total,
    },
    total,
    features: [
      '✓ Quality aftermarket parts',
      '✓ Professional repair',
      '✓ Standard paint match',
      '✓ 1-year warranty on parts',
      '✓ 6-month warranty on labor',
    ],
    warranty: '1 year parts / 6 months labor',
    timelineEstimate: '5-7 business days',
  };
}

/**
 * Generate OEM (Original Equipment) estimate
 */
function generateOEMEstimate(baseCosts: {
  parts: number;
  labor: number;
  paint: number;
  shopSupplies: number;
}): EstimateOption {
  const mult = TIER_MULTIPLIERS.oem;

  const parts = baseCosts.parts * mult.parts;
  const labor = baseCosts.labor * mult.labor;
  const paint = baseCosts.paint * mult.paint;
  const shopSupplies = baseCosts.shopSupplies * mult.supplies;
  const subtotal = parts + labor + paint + shopSupplies;
  const tax = subtotal * 0.08;
  const total = Math.round((subtotal + tax) / 10) * 10;

  return {
    tier: 'oem',
    title: 'OEM Parts',
    description: 'Original manufacturer parts with certified repair',
    breakdown: {
      parts: Math.round(parts),
      labor: Math.round(labor),
      paint: Math.round(paint),
      shopSupplies: Math.round(shopSupplies),
      tax: Math.round(tax),
      total,
    },
    total,
    features: [
      '✓ Original manufacturer parts',
      '✓ Certified technicians',
      '✓ Factory paint specifications',
      '✓ 3-year warranty on parts',
      '✓ 2-year warranty on labor',
      '✓ OEM repair procedures',
    ],
    warranty: '3 years parts / 2 years labor',
    timelineEstimate: '7-10 business days',
    recommended: true,
    popularChoice: true,
  };
}

/**
 * Generate Premium estimate
 */
function generatePremiumEstimate(
  baseCosts: {
    parts: number;
    labor: number;
    paint: number;
    shopSupplies: number;
  },
  oemTotal: number
): EstimateOption {
  const mult = TIER_MULTIPLIERS.premium;

  const parts = baseCosts.parts * mult.parts;
  const labor = baseCosts.labor * mult.labor;
  const paint = baseCosts.paint * mult.paint;
  const shopSupplies = baseCosts.shopSupplies * mult.supplies;
  const subtotal = parts + labor + paint + shopSupplies;
  const tax = subtotal * 0.08;
  const total = Math.round((subtotal + tax) / 10) * 10;

  return {
    tier: 'premium',
    title: 'Premium Restoration',
    description: 'Highest quality parts and finish with extended warranty',
    breakdown: {
      parts: Math.round(parts),
      labor: Math.round(labor),
      paint: Math.round(paint),
      shopSupplies: Math.round(shopSupplies),
      tax: Math.round(tax),
      total,
    },
    total,
    features: [
      '✓ Original manufacturer parts',
      '✓ Master certified technicians',
      '✓ Premium multi-stage paint',
      '✓ Ceramic coating included',
      '✓ Lifetime warranty on parts',
      '✓ 5-year warranty on labor',
      '✓ Detailed vehicle inspection',
      '✓ Complimentary detailing',
    ],
    warranty: 'Lifetime parts / 5 years labor',
    timelineEstimate: '10-14 business days',
  };
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(basicTotal: number, oemTotal: number): number {
  return Math.round(((oemTotal - basicTotal) / oemTotal) * 100);
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: EstimateTier): string {
  switch (tier) {
    case 'basic':
      return '#34C759';
    case 'oem':
      return '#007AFF';
    case 'premium':
      return '#FF9500';
    default:
      return '#8E8E93';
  }
}

/**
 * Format price comparison
 */
export function formatPriceComparison(basic: number, oem: number, premium: number): {
  lowestPrice: number;
  highestPrice: number;
  range: string;
  averagePrice: number;
} {
  return {
    lowestPrice: basic,
    highestPrice: premium,
    range: `$${basic.toLocaleString()} - $${premium.toLocaleString()}`,
    averagePrice: Math.round((basic + oem + premium) / 3),
  };
}
