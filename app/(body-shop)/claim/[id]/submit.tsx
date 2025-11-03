import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useClaim } from '@/contexts/claim-context';
import { Button } from '@/components/buttons';

export default function SubmitClaimScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { claims, submitClaim, lockInsuranceInfo, validateInsuranceInfo } = useClaim();
  const router = useRouter();

  const claim = claims.find((c) => c.id === id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insuranceStatus = claim ? validateInsuranceInfo(claim.insuranceInfo) : 'none';

  const handleSubmit = async () => {
    if (!id) return;

    // Check insurance status
    if (insuranceStatus === 'none' || insuranceStatus === 'partial') {
      Alert.alert(
        'Insurance Information ' + (insuranceStatus === 'none' ? 'Missing' : 'Incomplete'),
        insuranceStatus === 'none'
          ? 'No insurance information has been provided for this claim. It is recommended to add insurance details before submission.\n\nWould you like to continue anyway?'
          : 'Insurance information is incomplete (missing agent details or policy info). It is recommended to complete all fields before submission.\n\nWould you like to continue anyway?',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'Add Insurance Info', onPress: () => router.back() },
          {
            text: 'Submit Anyway',
            style: 'destructive',
            onPress: () => confirmSubmit(),
          },
        ]
      );
      return;
    }

    confirmSubmit();
  };

  const confirmSubmit = () => {
    Alert.alert(
      'Submit Estimate',
      'Are you ready to submit this estimate to insurance for review?\n\nNote: Insurance information will be locked after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              // Simulate submission delay
              await new Promise((resolve) => setTimeout(resolve, 1500));

              // Lock insurance info before submitting
              if (id) {
                await lockInsuranceInfo(id);
              }

              await submitClaim(id!);

              Alert.alert(
                'Success!',
                'Your estimate has been submitted to insurance. Insurance information is now locked. You will be notified when it is reviewed.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(body-shop)/(tabs)/dashboard'),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to submit claim. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (!claim || !claim.estimate) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <Text style={[styles.errorText, { color: Colors.text }]}>
          Claim not found or estimate not generated
        </Text>
      </View>
    );
  }

  // Calculate auto-approval likelihood
  const autoApprovalThreshold = 5000;
  const willAutoApprove = claim.estimate.total < autoApprovalThreshold;

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Review & Submit</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Final check before submitting to insurance
          </Text>
        </View>

        <View style={[styles.estimateCard, { backgroundColor: Colors.tint }]}>
          <Text style={styles.estimateLabel}>Total Estimate</Text>
          <Text style={styles.estimateValue}>${claim.estimate.total.toFixed(2)}</Text>
        </View>

        {willAutoApprove ? (
          <View style={[styles.successCard, { backgroundColor: '#34c759' + '20', borderColor: '#34c759' }]}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={[styles.successTitle, { color: Colors.text }]}>
              Likely Auto-Approved
            </Text>
            <Text style={[styles.successText, { color: Colors.textSecondary }]}>
              Estimates under ${autoApprovalThreshold.toLocaleString()} are typically approved
              automatically within 24 hours
            </Text>
          </View>
        ) : (
          <View style={[styles.warningCard, { backgroundColor: '#ff9500' + '20', borderColor: '#ff9500' }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningTitle, { color: Colors.text }]}>Manual Review Required</Text>
            <Text style={[styles.warningText, { color: Colors.textSecondary }]}>
              Estimates over ${autoApprovalThreshold.toLocaleString()} require adjuster review.
              Expected response time: 2-3 business days
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Claim Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: '#f2f2f7' }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Vehicle</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Photos</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                {claim.photos.length} photos
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Damaged Areas</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                {claim.damageAssessment?.detectedDamages.length} areas
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>AI Confidence</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                {((claim.damageAssessment?.confidence || 0) * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Format</Text>
              <Text style={[styles.summaryValue, { color: Colors.text }]}>
                {claim.estimate.format === 'ccc_one' ? 'CCC ONE' : 'Mitchell'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Insurance Information</Text>
          <View style={[styles.summaryCard, { backgroundColor: '#f2f2f7' }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      insuranceStatus === 'complete'
                        ? '#34C759' + '20'
                        : insuranceStatus === 'partial'
                        ? '#FF9500' + '20'
                        : '#8E8E93' + '20',
                  },
                ]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        insuranceStatus === 'complete'
                          ? '#34C759'
                          : insuranceStatus === 'partial'
                          ? '#FF9500'
                          : '#8E8E93',
                    },
                  ]}>
                  {insuranceStatus === 'complete'
                    ? 'Complete'
                    : insuranceStatus === 'partial'
                    ? 'Partial'
                    : 'Not Provided'}
                </Text>
              </View>
            </View>
            {claim.insuranceInfo?.provider && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Provider</Text>
                  <Text style={[styles.summaryValue, { color: Colors.text }]}>
                    {claim.insuranceInfo.provider}
                  </Text>
                </View>
              </>
            )}
            {claim.insuranceInfo?.policyNumber && (
              <>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: Colors.textSecondary }]}>Policy #</Text>
                  <Text style={[styles.summaryValue, { color: Colors.text }]}>
                    {claim.insuranceInfo.policyNumber}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: '#f2f2f7' }]}>
          <Text style={[styles.infoTitle, { color: Colors.text }]}>What happens next?</Text>
          <Text style={[styles.infoItem, { color: Colors.textSecondary }]}>
            1. Your estimate is sent to the insurance company
          </Text>
          <Text style={[styles.infoItem, { color: Colors.textSecondary }]}>
            2. AI fraud detection screens the claim
          </Text>
          <Text style={[styles.infoItem, { color: Colors.textSecondary }]}>
            3. {willAutoApprove ? 'Auto-approval' : 'Adjuster reviews'} the estimate
          </Text>
          <Text style={[styles.infoItem, { color: Colors.textSecondary }]}>
            4. You receive notification of approval/denial
          </Text>
        </View>

        <Button
          title="Submit to Insurance"
          onPress={handleSubmit}
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        />

        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="secondary"
          disabled={isSubmitting}
        />
      </View>
    </ScrollView>
  );
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
  },
  errorText: {
    fontSize: 16,
  },
  estimateCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  estimateLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  estimateValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  successCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
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
    paddingVertical: 8,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
