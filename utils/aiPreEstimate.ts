import { DamageAssessment, PreEstimate, DamageSeverity, DamageArea } from '@/types';

/**
 * AI Pre-Estimate Generator
 * Generates instant preliminary cost estimates based on detected damage
 */

// Base repair costs by damage area (in USD)
const DAMAGE_AREA_COSTS: Record<DamageArea, { repair: number; replace: number }> = {
  front_bumper: { repair: 500, replace: 1200 },
  hood: { repair: 800, replace: 1500 },
  fender_left: { repair: 600, replace: 1100 },
  fender_right: { repair: 600, replace: 1100 },
  door_front_left: { repair: 700, replace: 1400 },
  door_front_right: { repair: 700, replace: 1400 },
  door_rear_left: { repair: 700, replace: 1400 },
  door_rear_right: { repair: 700, replace: 1400 },
  quarter_panel_left: { repair: 900, replace: 1800 },
  quarter_panel_right: { repair: 900, replace: 1800 },
  rear_bumper: { repair: 500, replace: 1200 },
  trunk: { repair: 700, replace: 1500 },
  roof: { repair: 1500, replace: 3000 },
  windshield: { repair: 200, replace: 400 },
  headlight_left: { repair: 100, replace: 600 },
  headlight_right: { repair: 100, replace: 600 },
  taillight_left: { repair: 100, replace: 400 },
  taillight_right: { repair: 100, replace: 400 },
};

// Severity multipliers
const SEVERITY_MULTIPLIERS: Record<DamageSeverity, number> = {
  minor: 0.6,
  moderate: 1.0,
  severe: 1.5,
};

// Confidence adjustment factors
const CONFIDENCE_VARIANCE = 0.15; // ±15% variance for low confidence

/**
 * Generate a preliminary estimate based on damage assessment
 */
export function generatePreEstimate(damageAssessment: DamageAssessment): PreEstimate {
  let totalLow = 0;
  let totalHigh = 0;
  let totalTypical = 0;
  const basedOnDamages: string[] = [];

  // Calculate costs for each detected damage
  damageAssessment.detectedDamages.forEach((damage) => {
    const baseCost = DAMAGE_AREA_COSTS[damage.area];
    const cost = damage.repairType === 'repair' ? baseCost.repair : baseCost.replace;
    const severityMultiplier = SEVERITY_MULTIPLIERS[damage.severity];

    // Base calculation
    const typicalCost = cost * severityMultiplier;

    // Confidence-based variance
    const confidenceAdjustment = damage.confidence < 0.7 ? CONFIDENCE_VARIANCE : 0.1;
    const lowCost = typicalCost * (1 - confidenceAdjustment);
    const highCost = typicalCost * (1 + confidenceAdjustment);

    totalLow += lowCost;
    totalHigh += highCost;
    totalTypical += typicalCost;

    // Add to damage list
    basedOnDamages.push(
      `${formatDamageArea(damage.area)} (${damage.severity}${damage.repairType === 'replace' ? ' - replace' : ''})`
    );
  });

  // Add labor costs (30% of parts)
  const laborMultiplier = 1.3;
  totalLow *= laborMultiplier;
  totalHigh *= laborMultiplier;
  totalTypical *= laborMultiplier;

  // Add paint and supplies (20% of total)
  const suppliesMultiplier = 1.2;
  totalLow *= suppliesMultiplier;
  totalHigh *= suppliesMultiplier;
  totalTypical *= suppliesMultiplier;

  // Round to nearest 50
  totalLow = Math.round(totalLow / 50) * 50;
  totalHigh = Math.round(totalHigh / 50) * 50;
  totalTypical = Math.round(totalTypical / 50) * 50;

  // Calculate repair days based on number of damages
  const damageCount = damageAssessment.detectedDamages.length;
  const minDays = Math.max(2, Math.ceil(damageCount * 0.5));
  const maxDays = Math.ceil(damageCount * 1.5);

  // Estimate similar claims count (mock data - in production would query database)
  const similarClaimsCount = Math.floor(Math.random() * 50) + 20;

  // Overall confidence based on individual damage confidences
  const avgConfidence = damageAssessment.detectedDamages.reduce(
    (sum, damage) => sum + damage.confidence,
    0
  ) / damageAssessment.detectedDamages.length;

  const confidence = Math.round(avgConfidence * damageAssessment.confidence * 100);

  return {
    id: `pre-est-${Date.now()}`,
    range: {
      low: totalLow,
      high: totalHigh,
      typical: totalTypical,
    },
    confidence,
    basedOnDamages,
    similarClaimsCount,
    estimatedRepairDays: {
      min: minDays,
      max: maxDays,
    },
    generatedAt: new Date(),
    disclaimer:
      'This is a preliminary AI-generated estimate. Your final estimate from the body shop may vary based on hidden damage, parts availability, and labor rates.',
  };
}

/**
 * Format damage area for display
 */
function formatDamageArea(area: DamageArea): string {
  return area
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get confidence level description
 */
export function getConfidenceDescription(confidence: number): {
  level: 'high' | 'medium' | 'low';
  description: string;
  color: string;
} {
  if (confidence >= 80) {
    return {
      level: 'high',
      description: 'Very confident in this estimate',
      color: '#34C759',
    };
  } else if (confidence >= 60) {
    return {
      level: 'medium',
      description: 'Moderately confident - may vary',
      color: '#FF9500',
    };
  } else {
    return {
      level: 'low',
      description: 'Lower confidence - expect variation',
      color: '#FF3B30',
    };
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
