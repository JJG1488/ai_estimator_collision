import { DamageAssessment, Vehicle, Estimate, EstimateLineItem, EstimateFormat } from '@/types';
import { enhancePartsWithPricing, getPaintCost, estimatePaintWork, calculateTaxAndFees } from './mock-pricing-service';

/**
 * Estimate Service - Generates formatted repair estimates
 * Calculates costs and formats output for insurance systems
 */

export async function generateEstimate(
  assessment: DamageAssessment,
  vehicle: Vehicle,
  format: EstimateFormat = 'ccc_one'
): Promise<Estimate> {
  const lineItems: EstimateLineItem[] = [];

  // Process all damaged areas and their parts
  for (const damage of assessment.detectedDamages) {
    // Enhance parts with actual pricing
    const pricedParts = await enhancePartsWithPricing(damage.affectedParts, vehicle);

    // Add part line items
    for (const part of pricedParts) {
      lineItems.push({
        type: 'part',
        description: `${part.name} - ${damage.repairType}`,
        quantity: 1,
        unitPrice: part.price,
        total: part.price,
        partId: part.id,
      });

      // Add labor line item for this part
      const laborCost = part.laborHours * part.laborRate;
      lineItems.push({
        type: 'labor',
        description: `Labor: ${part.name}`,
        quantity: part.laborHours,
        unitPrice: part.laborRate,
        total: laborCost,
        partId: part.id,
      });
    }
  }

  // Calculate paint work
  const damagedAreas = assessment.detectedDamages.map((d) => d.area);
  const { panelsToRepaint, blendPanels } = estimatePaintWork(damagedAreas);
  const paintCost = await getPaintCost(panelsToRepaint, blendPanels);

  lineItems.push({
    type: 'paint',
    description: `Paint & Refinish (${panelsToRepaint} panels, ${blendPanels} blend)`,
    quantity: panelsToRepaint,
    unitPrice: paintCost / panelsToRepaint,
    total: paintCost,
  });

  // Add shop supplies
  const subtotalBeforeSupplies = lineItems.reduce((sum, item) => sum + item.total, 0);
  const suppliesCost = Math.round(subtotalBeforeSupplies * 0.03 * 100) / 100;

  lineItems.push({
    type: 'supplies',
    description: 'Shop Supplies & Materials',
    quantity: 1,
    unitPrice: suppliesCost,
    total: suppliesCost,
  });

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const { tax, total } = calculateTaxAndFees(subtotal);

  // Generate estimate
  const estimate: Estimate = {
    id: Math.random().toString(36).substr(2, 9),
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    format,
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };

  return estimate;
}

/**
 * Format estimate in CCC ONE style
 */
export function formatCCCOne(estimate: Estimate, vehicle: Vehicle, claimId: string): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('CCC ONE ESTIMATING SYSTEM');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Estimate #: ${claimId}`);
  lines.push(`Date: ${estimate.generatedAt.toLocaleDateString()}`);
  lines.push(`Valid Until: ${estimate.expiresAt.toLocaleDateString()}`);
  lines.push('');
  lines.push('VEHICLE INFORMATION:');
  lines.push(`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`);
  if (vehicle.vin) lines.push(`VIN: ${vehicle.vin}`);
  lines.push('');
  lines.push('-'.repeat(80));
  lines.push(
    `${'DESCRIPTION'.padEnd(40)}${'QTY'.padStart(8)}${'PRICE'.padStart(12)}${'TOTAL'.padStart(12)}`
  );
  lines.push('-'.repeat(80));

  // Group items by type
  const parts = estimate.lineItems.filter((i) => i.type === 'part');
  const labor = estimate.lineItems.filter((i) => i.type === 'labor');
  const paint = estimate.lineItems.filter((i) => i.type === 'paint');
  const supplies = estimate.lineItems.filter((i) => i.type === 'supplies');

  if (parts.length > 0) {
    lines.push('');
    lines.push('PARTS:');
    parts.forEach((item) => {
      lines.push(
        `${item.description.padEnd(40)}${item.quantity
          .toString()
          .padStart(8)}${'$' + item.unitPrice.toFixed(2).padStart(11)}${'$' + item.total.toFixed(2).padStart(11)}`
      );
    });
  }

  if (labor.length > 0) {
    lines.push('');
    lines.push('LABOR:');
    labor.forEach((item) => {
      lines.push(
        `${item.description.padEnd(40)}${item.quantity.toFixed(1).padStart(8)}${'$' + item.unitPrice.toFixed(2).padStart(11)}${'$' + item.total.toFixed(2).padStart(11)}`
      );
    });
  }

  if (paint.length > 0) {
    lines.push('');
    lines.push('PAINT & REFINISH:');
    paint.forEach((item) => {
      lines.push(
        `${item.description.padEnd(40)}${item.quantity.toString().padStart(8)}${'$' + item.unitPrice.toFixed(2).padStart(11)}${'$' + item.total.toFixed(2).padStart(11)}`
      );
    });
  }

  if (supplies.length > 0) {
    lines.push('');
    lines.push('SUPPLIES:');
    supplies.forEach((item) => {
      lines.push(
        `${item.description.padEnd(40)}${item.quantity.toString().padStart(8)}${'$' + item.unitPrice.toFixed(2).padStart(11)}${'$' + item.total.toFixed(2).padStart(11)}`
      );
    });
  }

  lines.push('-'.repeat(80));
  lines.push(`${'SUBTOTAL:'.padEnd(60)}${'$' + estimate.subtotal.toFixed(2).padStart(12)}`);
  lines.push(`${'TAX (8%):'.padEnd(60)}${'$' + estimate.tax.toFixed(2).padStart(12)}`);
  lines.push('='.repeat(80));
  lines.push(`${'TOTAL:'.padEnd(60)}${'$' + estimate.total.toFixed(2).padStart(12)}`);
  lines.push('='.repeat(80));

  return lines.join('\n');
}

/**
 * Format estimate in Mitchell style
 */
export function formatMitchell(estimate: Estimate, vehicle: Vehicle, claimId: string): string {
  const lines: string[] = [];

  lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
  lines.push('║                        MITCHELL REPAIR ESTIMATE                               ║');
  lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`Estimate Number: ${claimId}`);
  lines.push(`Created: ${estimate.generatedAt.toLocaleDateString()}`);
  lines.push('');
  lines.push('VEHICLE:');
  lines.push(`  Year/Make/Model: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
  if (vehicle.vin) lines.push(`  VIN: ${vehicle.vin}`);
  lines.push('');
  lines.push('REPAIR OPERATIONS:');
  lines.push('─'.repeat(80));

  estimate.lineItems.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.description}`);
    lines.push(
      `   Qty: ${item.quantity}  @  $${item.unitPrice.toFixed(2)}  =  $${item.total.toFixed(2)}`
    );
  });

  lines.push('─'.repeat(80));
  lines.push('');
  lines.push('ESTIMATE SUMMARY:');
  lines.push(`  Subtotal:        $${estimate.subtotal.toFixed(2)}`);
  lines.push(`  Sales Tax:       $${estimate.tax.toFixed(2)}`);
  lines.push(`  ───────────────────────────`);
  lines.push(`  TOTAL ESTIMATE:  $${estimate.total.toFixed(2)}`);
  lines.push('');
  lines.push(`Valid through: ${estimate.expiresAt.toLocaleDateString()}`);

  return lines.join('\n');
}

/**
 * Get estimate summary statistics
 */
export function getEstimateSummary(estimate: Estimate) {
  const partsCost = estimate.lineItems
    .filter((i) => i.type === 'part')
    .reduce((sum, i) => sum + i.total, 0);

  const laborCost = estimate.lineItems
    .filter((i) => i.type === 'labor')
    .reduce((sum, i) => sum + i.total, 0);

  const paintCost = estimate.lineItems
    .filter((i) => i.type === 'paint')
    .reduce((sum, i) => sum + i.total, 0);

  const totalLaborHours = estimate.lineItems
    .filter((i) => i.type === 'labor')
    .reduce((sum, i) => sum + i.quantity, 0);

  return {
    partsCost: Math.round(partsCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    paintCost: Math.round(paintCost * 100) / 100,
    totalLaborHours: Math.round(totalLaborHours * 10) / 10,
    partsCount: estimate.lineItems.filter((i) => i.type === 'part').length,
  };
}
