import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { useClaim } from '@/contexts/claim-context';
import { analyzeDamage, getAreaDisplayName } from '@/services/mock-ai-service';
import { DamageAssessment } from '@/types';
import { Button } from '@/components/buttons';

export default function DamageAssessmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { claims, setDamageAssessment } = useClaim();
  const router = useRouter();

  const claim = claims.find((c) => c.id === id);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<DamageAssessment | null>(
    claim?.damageAssessment || null
  );

  useEffect(() => {
    if (!assessment && claim?.photos && claim.photos.length > 0) {
      startAnalysis();
    }
  }, []);

  const startAnalysis = async () => {
    if (!claim?.photos || claim.photos.length === 0) {
      Alert.alert('Error', 'No photos available for analysis');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeDamage(claim.photos);
      setAssessment(result);

      if (id) {
        await setDamageAssessment(id, result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze damage. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinue = () => {
    if (!id) return;
    router.push(`/(body-shop)/claim/${id}/estimate`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return '#34c759';
      case 'moderate':
        return '#ff9500';
      case 'severe':
        return '#ff3b30';
      default:
        return Colors.textSecondary;
    }
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.tint} />
        <Text style={[styles.analyzingText, { color: Colors.text }]}>Analyzing Damage...</Text>
        <Text style={[styles.analyzingSubtext, { color: Colors.textSecondary }]}>
          Our AI is examining {claim?.photos.length} photos
        </Text>
      </View>
    );
  }

  if (!assessment) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <Text style={[styles.errorText, { color: Colors.text }]}>
          No assessment available
        </Text>
        <Button
          title="Start Analysis"
          onPress={startAnalysis}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Damage Assessment</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            AI-powered analysis complete
          </Text>

          <View style={[styles.confidenceCard, { backgroundColor: '#f2f2f7' }]}>
            <Text style={[styles.confidenceLabel, { color: Colors.textSecondary }]}>
              Confidence Score
            </Text>
            <Text style={[styles.confidenceValue, { color: Colors.tint }]}>
              {(assessment.confidence * 100).toFixed(0)}%
            </Text>
            <Text style={[styles.confidenceNote, { color: Colors.textSecondary }]}>
              Analysis completed in {(assessment.processingTime / 1000).toFixed(1)}s
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Detected Damage ({assessment.detectedDamages.length})
          </Text>

          {assessment.detectedDamages.map((damage, index) => (
            <View
              key={damage.id}
              style={[styles.damageCard, { backgroundColor: '#f2f2f7' }]}>
              <View style={styles.damageHeader}>
                <Text style={[styles.damageArea, { color: Colors.text }]}>
                  {getAreaDisplayName(damage.area)}
                </Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(damage.severity) },
                  ]}>
                  <Text style={styles.severityText}>
                    {damage.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.damageDetails}>
                <Text style={[styles.detailLabel, { color: Colors.textSecondary }]}>
                  Repair Type:
                </Text>
                <Text style={[styles.detailValue, { color: Colors.text }]}>
                  {damage.repairType === 'replace' ? 'Replace' : 'Repair'}
                </Text>
              </View>

              <View style={styles.damageDetails}>
                <Text style={[styles.detailLabel, { color: Colors.textSecondary }]}>
                  Damage Types:
                </Text>
                <Text style={[styles.detailValue, { color: Colors.text }]}>
                  {damage.damageTypes.join(', ')}
                </Text>
              </View>

              <View style={styles.damageDetails}>
                <Text style={[styles.detailLabel, { color: Colors.textSecondary }]}>
                  Affected Parts ({damage.affectedParts.length}):
                </Text>
              </View>
              {damage.affectedParts.map((part) => (
                <Text key={part.id} style={[styles.partItem, { color: Colors.text }]}>
                  • {part.name}
                </Text>
              ))}

              <View style={[styles.confidenceMeter, { backgroundColor: Colors.textSecondary + '30' }]}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      backgroundColor: Colors.tint,
                      width: `${damage.confidence * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.confidenceSmall, { color: Colors.textSecondary }]}>
                {(damage.confidence * 100).toFixed(0)}% confidence
              </Text>
            </View>
          ))}
        </View>

        {assessment.potentialHiddenDamage.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              ⚠️ Potential Hidden Damage
            </Text>
            <View
              style={[
                styles.hiddenDamageCard,
                { backgroundColor: '#ff9500' + '20', borderColor: '#ff9500' },
              ]}>
              {assessment.potentialHiddenDamage.map((item, index) => (
                <Text key={index} style={[styles.hiddenDamageItem, { color: Colors.text }]}>
                  • {item}
                </Text>
              ))}
              <Text style={[styles.hiddenDamageNote, { color: Colors.textSecondary }]}>
                Supplement may be required after teardown
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: Colors.background, borderTopColor: Colors.border }]}>
        <Button
          title="Generate Estimate"
          onPress={handleContinue}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
  confidenceCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  confidenceValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  confidenceNote: {
    fontSize: 12,
    marginTop: 4,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  damageCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  damageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  damageArea: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  damageDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  partItem: {
    fontSize: 14,
    marginLeft: 12,
    marginBottom: 4,
  },
  confidenceMeter: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceSmall: {
    fontSize: 12,
  },
  hiddenDamageCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  hiddenDamageItem: {
    fontSize: 14,
    marginBottom: 8,
  },
  hiddenDamageNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
});
