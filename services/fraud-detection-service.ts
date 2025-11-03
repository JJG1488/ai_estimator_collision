import { Claim } from '@/types';

/**
 * Mock Fraud Detection Service
 * In production, this would use ML models to detect fraudulent claims
 */

interface FraudIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FraudAnalysis {
  score: number; // 0-100, higher = more suspicious
  indicators: FraudIndicator[];
  recommendation: 'approve' | 'review' | 'investigate';
  confidence: number;
}

export async function analyzeFraud(claim: Claim): Promise<FraudAnalysis> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const indicators: FraudIndicator[] = [];
  let score = 0;

  // Check 1: Estimate amount
  if (claim.estimate && claim.estimate.total > 10000) {
    score += 15;
    indicators.push({
      type: 'high_value',
      severity: 'medium',
      description: `High estimate value: $${claim.estimate.total.toFixed(2)}`,
    });
  }

  // Check 2: Number of photos (too few might be suspicious)
  if (claim.photos.length < 4) {
    score += 20;
    indicators.push({
      type: 'insufficient_documentation',
      severity: 'medium',
      description: `Only ${claim.photos.length} photos provided`,
    });
  }

  // Check 3: Damage assessment confidence
  if (claim.damageAssessment && claim.damageAssessment.confidence < 0.7) {
    score += 10;
    indicators.push({
      type: 'low_confidence',
      severity: 'low',
      description: `Low AI confidence: ${(claim.damageAssessment.confidence * 100).toFixed(0)}%`,
    });
  }

  // Check 4: Multiple severe damage areas (could indicate total loss fraud)
  const severeAreas = claim.damageAssessment?.detectedDamages.filter(
    (d) => d.severity === 'severe'
  ).length || 0;

  if (severeAreas > 3) {
    score += 25;
    indicators.push({
      type: 'extensive_damage',
      severity: 'high',
      description: `${severeAreas} areas with severe damage`,
    });
  }

  // Check 5: Hidden damage flags
  const hiddenDamageCount = claim.damageAssessment?.potentialHiddenDamage.length || 0;
  if (hiddenDamageCount > 2) {
    score += 15;
    indicators.push({
      type: 'potential_supplements',
      severity: 'medium',
      description: `${hiddenDamageCount} potential hidden damage areas`,
    });
  }

  // Check 6: Vehicle age (older vehicles might have inflated claims)
  const vehicleAge = new Date().getFullYear() - claim.vehicle.year;
  if (vehicleAge > 10 && claim.estimate && claim.estimate.total > 8000) {
    score += 15;
    indicators.push({
      type: 'vehicle_age_anomaly',
      severity: 'medium',
      description: `High repair cost for ${vehicleAge}-year-old vehicle`,
    });
  }

  // Random variation to make it realistic
  score += Math.random() * 10 - 5;
  score = Math.max(0, Math.min(100, score));

  // Determine recommendation
  let recommendation: 'approve' | 'review' | 'investigate';
  if (score < 30) {
    recommendation = 'approve';
  } else if (score < 70) {
    recommendation = 'review';
  } else {
    recommendation = 'investigate';
  }

  const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence

  return {
    score: Math.round(score),
    indicators,
    recommendation,
    confidence,
  };
}

export function getFraudRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}

export function getFraudRiskColor(score: number): string {
  if (score < 30) return '#34c759';
  if (score < 70) return '#ff9500';
  return '#ff3b30';
}
