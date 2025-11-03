import { Photo, DamageAssessment, DetectedDamage, DamageArea, DamageSeverity, Part } from '@/types';

/**
 * Mock AI Service - Simulates AI-powered damage detection
 * In production, this would call an actual AI/ML API (OpenAI Vision, Google Cloud Vision, etc.)
 */

const DAMAGE_PARTS_DATABASE: Record<DamageArea, { partNames: string[]; avgPrice: number }> = {
  front_bumper: { partNames: ['Front Bumper Cover', 'Bumper Reinforcement', 'Grille'], avgPrice: 450 },
  hood: { partNames: ['Hood Panel', 'Hood Latch'], avgPrice: 650 },
  fender_left: { partNames: ['Left Front Fender', 'Fender Liner'], avgPrice: 380 },
  fender_right: { partNames: ['Right Front Fender', 'Fender Liner'], avgPrice: 380 },
  door_front_left: { partNames: ['Left Front Door Shell', 'Door Handle', 'Window Regulator'], avgPrice: 550 },
  door_front_right: { partNames: ['Right Front Door Shell', 'Door Handle', 'Window Regulator'], avgPrice: 550 },
  door_rear_left: { partNames: ['Left Rear Door Shell', 'Door Handle'], avgPrice: 520 },
  door_rear_right: { partNames: ['Right Rear Door Shell', 'Door Handle'], avgPrice: 520 },
  quarter_panel_left: { partNames: ['Left Quarter Panel', 'Tail Light'], avgPrice: 720 },
  quarter_panel_right: { partNames: ['Right Quarter Panel', 'Tail Light'], avgPrice: 720 },
  rear_bumper: { partNames: ['Rear Bumper Cover', 'Bumper Reinforcement'], avgPrice: 420 },
  roof: { partNames: ['Roof Panel'], avgPrice: 1200 },
  windshield: { partNames: ['Windshield Glass', 'Windshield Molding'], avgPrice: 350 },
  headlight_left: { partNames: ['Left Headlight Assembly'], avgPrice: 280 },
  headlight_right: { partNames: ['Right Headlight Assembly'], avgPrice: 280 },
  taillight_left: { partNames: ['Left Tail Light Assembly'], avgPrice: 180 },
  taillight_right: { partNames: ['Right Tail Light Assembly'], avgPrice: 180 },
};

function simulateDamageDetection(photos: Photo[]): DetectedDamage[] {
  const damages: DetectedDamage[] = [];

  // Analyze photo angles to determine likely damage areas
  const photoAngles = photos.map((p) => p.angle);

  // Front damage detection
  if (photoAngles.includes('front') || photoAngles.includes('front_driver') || photoAngles.includes('front_passenger')) {
    const severity: DamageSeverity = Math.random() > 0.5 ? 'moderate' : 'severe';
    damages.push(createMockDamage('front_bumper', severity, 0.92));

    if (Math.random() > 0.6) {
      damages.push(createMockDamage('hood', 'minor', 0.78));
    }
  }

  // Side damage detection
  if (photoAngles.includes('driver_side')) {
    const severity: DamageSeverity = Math.random() > 0.7 ? 'minor' : 'moderate';
    damages.push(createMockDamage('door_front_left', severity, 0.88));

    if (Math.random() > 0.5) {
      damages.push(createMockDamage('fender_left', 'moderate', 0.82));
    }
  }

  if (photoAngles.includes('passenger_side')) {
    const severity: DamageSeverity = Math.random() > 0.7 ? 'minor' : 'moderate';
    damages.push(createMockDamage('door_front_right', severity, 0.86));
  }

  // Rear damage detection
  if (photoAngles.includes('rear') || photoAngles.includes('rear_driver') || photoAngles.includes('rear_passenger')) {
    const severity: DamageSeverity = Math.random() > 0.5 ? 'moderate' : 'severe';
    damages.push(createMockDamage('rear_bumper', severity, 0.90));

    if (Math.random() > 0.7) {
      damages.push(createMockDamage('taillight_right', 'severe', 0.95));
    }
  }

  return damages;
}

function createMockDamage(area: DamageArea, severity: DamageSeverity, confidence: number): DetectedDamage {
  const partsInfo = DAMAGE_PARTS_DATABASE[area];
  const repairType = severity === 'severe' ? 'replace' : Math.random() > 0.5 ? 'repair' : 'replace';

  const affectedParts: Part[] = partsInfo.partNames.map((name, index) => ({
    id: Math.random().toString(36).substr(2, 9),
    name,
    category: area.includes('light') ? 'glass' : area.includes('bumper') ? 'body' : 'body',
    price: partsInfo.avgPrice * (1 + (Math.random() - 0.5) * 0.3), // ±15% variance
    laborHours: repairType === 'replace' ? 2.5 + Math.random() * 2 : 1 + Math.random() * 1.5,
    laborRate: 85, // Will be set by pricing service
    repairType,
  }));

  // Determine damage types based on severity
  const damageTypes = [];
  if (severity === 'minor') {
    damageTypes.push('scratch', 'dent');
  } else if (severity === 'moderate') {
    damageTypes.push('dent', 'paint');
  } else {
    damageTypes.push('structural', 'crack');
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    area,
    severity,
    damageTypes: damageTypes as any[],
    affectedParts: repairType === 'replace' ? affectedParts : affectedParts.slice(0, 1),
    repairType,
    confidence,
  };
}

function detectPotentialHiddenDamage(damages: DetectedDamage[]): string[] {
  const hidden: string[] = [];

  // Check for structural damage indicators
  const hasSevereDamage = damages.some((d) => d.severity === 'severe');
  if (hasSevereDamage) {
    hidden.push('Frame alignment check recommended');
    hidden.push('Suspension inspection may be required');
  }

  // Check for front-end damage
  const hasFrontDamage = damages.some((d) =>
    d.area.includes('front') || d.area === 'hood'
  );
  if (hasFrontDamage) {
    hidden.push('Radiator and cooling system inspection recommended');
    hidden.push('Check for engine compartment damage');
  }

  // Check for side impact
  const hasSideDamage = damages.some((d) =>
    d.area.includes('door') || d.area.includes('fender')
  );
  if (hasSideDamage) {
    hidden.push('Check door alignment and latching mechanisms');
  }

  return hidden;
}

export async function analyzeDamage(photos: Photo[]): Promise<DamageAssessment> {
  // Simulate API processing delay
  const processingTime = 2000 + Math.random() * 2000; // 2-4 seconds
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  const detectedDamages = simulateDamageDetection(photos);
  const potentialHiddenDamage = detectPotentialHiddenDamage(detectedDamages);

  // Calculate overall confidence based on number of photos and damage clarity
  const baseConfidence = 0.75;
  const photoBonus = Math.min(photos.length / 8, 1) * 0.15; // Up to +15% for 8 photos
  const confidence = baseConfidence + photoBonus;

  return {
    detectedDamages,
    confidence: Math.min(confidence, 0.95),
    processingTime,
    potentialHiddenDamage,
  };
}

export function getAreaDisplayName(area: DamageArea): string {
  const names: Record<DamageArea, string> = {
    front_bumper: 'Front Bumper',
    hood: 'Hood',
    fender_left: 'Left Fender',
    fender_right: 'Right Fender',
    door_front_left: 'Front Left Door',
    door_front_right: 'Front Right Door',
    door_rear_left: 'Rear Left Door',
    door_rear_right: 'Rear Right Door',
    quarter_panel_left: 'Left Quarter Panel',
    quarter_panel_right: 'Right Quarter Panel',
    rear_bumper: 'Rear Bumper',
    roof: 'Roof',
    windshield: 'Windshield',
    headlight_left: 'Left Headlight',
    headlight_right: 'Right Headlight',
    taillight_left: 'Left Taillight',
    taillight_right: 'Right Taillight',
  };
  return names[area] || area;
}
