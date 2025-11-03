import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { useClaim } from '@/contexts/claim-context';
import { generateEstimate, getEstimateSummary, formatCCCOne } from '@/services/estimate-service';
import { Estimate } from '@/types';
import { Button } from '@/components/buttons';

export default function EstimateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { claims, setEstimate: saveEstimate } = useClaim();
  const router = useRouter();

  const claim = claims.find((c) => c.id === id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(claim?.estimate || null);

  useEffect(() => {
    if (!estimate && claim?.damageAssessment && claim?.vehicle) {
      generateEstimateNow();
    }
  }, []);

  const generateEstimateNow = async () => {
    if (!claim?.damageAssessment || !claim?.vehicle) return;

    setIsGenerating(true);

    try {
      const result = await generateEstimate(claim.damageAssessment, claim.vehicle);
      setEstimate(result);

      if (id) {
        await saveEstimate(id, result);
      }
    } catch (error) {
      alert('Failed to generate estimate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!estimate || !claim) return;

    const formatted = formatCCCOne(estimate, claim.vehicle, claim.id);

    try {
      await Share.share({
        message: formatted,
        title: 'Repair Estimate',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmit = () => {
    if (!id) return;
    router.push(`/(body-shop)/claim/${id}/submit`);
  };

  if (isGenerating) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.tint} />
        <Text style={[styles.loadingText, { color: Colors.text }]}>
          Generating Estimate...
        </Text>
      </View>
    );
  }

  if (!estimate) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <Text style={[styles.errorText, { color: Colors.text }]}>No estimate available</Text>
      </View>
    );
  }

  const summary = getEstimateSummary(estimate);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Repair Estimate</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            {claim?.vehicle.year} {claim?.vehicle.make} {claim?.vehicle.model}
          </Text>

          <View style={[styles.totalCard, { backgroundColor: Colors.tint }]}>
            <Text style={styles.totalLabel}>Total Estimate</Text>
            <Text style={styles.totalValue}>${estimate.total.toFixed(2)}</Text>
            <Text style={styles.totalNote}>
              Valid until {estimate.expiresAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: '#f2f2f7' }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Parts</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                ${summary.partsCost.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Labor</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                ${summary.laborCost.toFixed(2)} ({summary.totalLaborHours}hrs)
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Paint</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                ${summary.paintCost.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: Colors.textSecondary + '30' }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                ${estimate.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Tax</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                ${estimate.tax.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Line Items</Text>
          {estimate.lineItems.map((item, index) => (
            <View
              key={index}
              style={[styles.lineItem, { backgroundColor: '#f2f2f7' }]}>
              <View style={styles.lineItemHeader}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                  <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                </View>
                <Text style={[styles.lineItemTotal, { color: Colors.tint }]}>
                  ${item.total.toFixed(2)}
                </Text>
              </View>
              <Text style={[styles.lineItemDescription, { color: Colors.text }]}>
                {item.description}
              </Text>
              <Text style={[styles.lineItemDetails, { color: Colors.textSecondary }]}>
                Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: '#f2f2f7' }]}>
          <Text style={[styles.infoTitle, { color: Colors.text }]}>📋 Estimate Format</Text>
          <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
            {estimate.format === 'ccc_one' ? 'CCC ONE' : 'Mitchell'} compatible format
          </Text>
          <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
            Ready for insurance submission
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: Colors.background, borderTopColor: Colors.border }]}>
        <Button
          title="Share Estimate"
          onPress={handleShare}
          variant="secondary"
        />
        <Button
          title="Submit to Insurance"
          onPress={handleSubmit}
          variant="primary"
        />
      </View>
    </View>
  );
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'part':
      return '#007aff';
    case 'labor':
      return '#ff9500';
    case 'paint':
      return '#af52de';
    case 'supplies':
      return '#5ac8fa';
    default:
      return '#999';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 150,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  totalCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  totalValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  totalNote: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  lineItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  lineItemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lineItemDescription: {
    fontSize: 16,
    marginBottom: 4,
  },
  lineItemDetails: {
    fontSize: 14,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
});
