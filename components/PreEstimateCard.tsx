import { View, Text, StyleSheet } from 'react-native';
import { PreEstimate } from '@/types';
import { Colors } from '@/constants/theme';
import { getConfidenceDescription, formatCurrency } from '@/utils/aiPreEstimate';

interface PreEstimateCardProps {
  preEstimate: PreEstimate;
}

export default function PreEstimateCard({ preEstimate }: PreEstimateCardProps) {
  const confidenceInfo = getConfidenceDescription(preEstimate.confidence);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Instant AI Estimate</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: confidenceInfo.color + '20' }]}>
          <Text style={[styles.confidenceText, { color: confidenceInfo.color }]}>
            {preEstimate.confidence}% Confident
          </Text>
        </View>
      </View>

      {/* Main Estimate */}
      <View style={[styles.estimateBox, { backgroundColor: Colors.tint + '10', borderColor: Colors.tint }]}>
        <Text style={[styles.estimateLabel, { color: Colors.icon }]}>Estimated Repair Cost</Text>
        <Text style={[styles.estimateAmount, { color: Colors.tint }]}>
          {formatCurrency(preEstimate.range.typical)}
        </Text>
        <Text style={[styles.estimateRange, { color: Colors.icon }]}>
          Range: {formatCurrency(preEstimate.range.low)} - {formatCurrency(preEstimate.range.high)}
        </Text>
      </View>

      {/* Repair Timeline */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: Colors.icon }]}>Estimated Repair Time</Text>
          <Text style={[styles.infoValue, { color: Colors.text }]}>
            {preEstimate.estimatedRepairDays.min === preEstimate.estimatedRepairDays.max
              ? `${preEstimate.estimatedRepairDays.min} days`
              : `${preEstimate.estimatedRepairDays.min}-${preEstimate.estimatedRepairDays.max} days`}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={[styles.infoLabel, { color: Colors.icon }]}>Similar Claims</Text>
          <Text style={[styles.infoValue, { color: Colors.text }]}>
            {preEstimate.similarClaimsCount}+
          </Text>
        </View>
      </View>

      {/* Detected Damages */}
      {preEstimate.basedOnDamages.length > 0 && (
        <View style={styles.damagesSection}>
          <Text style={[styles.damagesTitle, { color: Colors.text }]}>Based on Detected Damage:</Text>
          {preEstimate.basedOnDamages.map((damage, index) => (
            <View key={index} style={styles.damageItem}>
              <Text style={[styles.damageBullet, { color: Colors.tint }]}>•</Text>
              <Text style={[styles.damageText, { color: Colors.text }]}>{damage}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Confidence Description */}
      <View style={[styles.confidenceBox, { backgroundColor: confidenceInfo.color + '15', borderColor: confidenceInfo.color }]}>
        <Text style={[styles.confidenceDescription, { color: confidenceInfo.color }]}>
          {confidenceInfo.description}
        </Text>
      </View>

      {/* Disclaimer */}
      <View style={[styles.disclaimerBox, { backgroundColor: '#FF950010', borderColor: '#FF9500' }]}>
        <Text style={[styles.disclaimerTitle, { color: '#FF9500' }]}>Important Note</Text>
        <Text style={[styles.disclaimerText, { color: Colors.text }]}>
          {preEstimate.disclaimer}
        </Text>
      </View>

      {/* Next Steps */}
      <View style={[styles.nextStepsBox, { backgroundColor: '#007AFF10' }]}>
        <Text style={[styles.nextStepsTitle, { color: '#007AFF' }]}>What's Next?</Text>
        <Text style={[styles.nextStepsText, { color: Colors.text }]}>
          A professional body shop will review your photos and provide a detailed final estimate within 24-48 hours.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f7',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  estimateBox: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  estimateLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  estimateAmount: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 4,
  },
  estimateRange: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  damagesSection: {
    marginBottom: 16,
  },
  damagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  damageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  damageBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  damageText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  confidenceBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  confidenceDescription: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  disclaimerBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  nextStepsBox: {
    borderRadius: 8,
    padding: 12,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  nextStepsText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
