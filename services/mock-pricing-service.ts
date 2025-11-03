import { Vehicle, Part } from '@/types';

/**
 * Mock Pricing Service - Simulates industry-standard pricing database
 * In production, this would integrate with CCC ONE, Mitchell, or Audatex APIs
 */

const LABOR_RATES_BY_REGION: Record<string, number> = {
  default: 85,
  northeast: 95,
  west: 105,
  south: 75,
  midwest: 80,
};

const PAINT_RATES = {
  perPanel: 250,
  blendAdjacentPanel: 150,
};

const PARTS_MARKUP = 1.2; // 20% markup on parts

export async function getLaborRate(zipCode?: string): Promise<number> {
  // In production, would look up region based on zip code
  // For now, return default with some variation
  await new Promise((resolve) => setTimeout(resolve, 100));

  const baseRate = LABOR_RATES_BY_REGION.default;
  const variance = (Math.random() - 0.5) * 10; // ±$5 variance

  return Math.round(baseRate + variance);
}

export async function getPartPrice(partName: string, vehicle: Vehicle): Promise<number> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Base prices vary by vehicle
  const vehicleAge = new Date().getFullYear() - vehicle.year;
  const ageMultiplier = 1 + (vehicleAge * 0.02); // Older parts may cost more (harder to find)

  // Mock part prices based on common auto parts
  const basePrices: Record<string, number> = {
    'Front Bumper Cover': 350,
    'Rear Bumper Cover': 320,
    'Bumper Reinforcement': 180,
    'Grille': 120,
    'Hood Panel': 550,
    'Hood Latch': 85,
    'Front Fender': 280,
    'Fender Liner': 45,
    'Door Shell': 450,
    'Door Handle': 65,
    'Window Regulator': 150,
    'Quarter Panel': 680,
    'Tail Light': 140,
    'Headlight Assembly': 250,
    'Windshield Glass': 280,
    'Windshield Molding': 35,
    'Roof Panel': 1100,
  };

  // Find matching part or return estimated price
  let basePrice = 200; // Default fallback
  for (const [key, price] of Object.entries(basePrices)) {
    if (partName.includes(key)) {
      basePrice = price;
      break;
    }
  }

  // Apply vehicle-specific adjustments
  const finalPrice = basePrice * ageMultiplier * PARTS_MARKUP;

  return Math.round(finalPrice * 100) / 100;
}

export async function getPaintCost(panelCount: number, blendCount: number = 0): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const panelCost = panelCount * PAINT_RATES.perPanel;
  const blendCost = blendCount * PAINT_RATES.blendAdjacentPanel;

  return panelCost + blendCost;
}

export async function calculateLaborCost(
  laborHours: number,
  laborRate?: number
): Promise<number> {
  const rate = laborRate || (await getLaborRate());
  return Math.round(laborHours * rate * 100) / 100;
}

export function estimatePaintWork(damagedAreas: string[]): {
  panelsToRepaint: number;
  blendPanels: number;
} {
  // Estimate how many panels need painting and blending
  const panelsToRepaint = damagedAreas.length;

  // Adjacent panels may need blending
  const blendPanels = Math.ceil(damagedAreas.length * 0.5);

  return {
    panelsToRepaint,
    blendPanels,
  };
}

export async function enhancePartsWithPricing(
  parts: Part[],
  vehicle: Vehicle
): Promise<Part[]> {
  const laborRate = await getLaborRate();

  const enhanced = await Promise.all(
    parts.map(async (part) => {
      const price = await getPartPrice(part.name, vehicle);
      return {
        ...part,
        price,
        laborRate,
      };
    })
  );

  return enhanced;
}

export function calculateTaxAndFees(subtotal: number): {
  tax: number;
  shopSupplies: number;
  total: number;
} {
  const taxRate = 0.08; // 8% sales tax (varies by state)
  const suppliesRate = 0.03; // 3% for shop supplies, materials

  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const shopSupplies = Math.round(subtotal * suppliesRate * 100) / 100;
  const total = subtotal + tax + shopSupplies;

  return {
    tax,
    shopSupplies,
    total,
  };
}
