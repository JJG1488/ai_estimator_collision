import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { InsuranceForm } from '@/components/insurance-form';
import { Button } from '@/components/buttons';
import { Claim, InsuranceInfo } from '@/types';
import { analyzeFraud, getFraudRiskLevel, getFraudRiskColor } from '@/services/fraud-detection-service';
import { getAreaDisplayName } from '@/services/mock-ai-service';

export default function ClaimReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { updateInsuranceInfo, flagInsuranceInfo, validateInsuranceInfo } = useClaim();
  const router = useRouter();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [fraudScore, setFraudScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showInsuranceEdit, setShowInsuranceEdit] = useState(false);
  const [insuranceData, setInsuranceData] = useState<InsuranceInfo | null>(null);
  const [insuranceIsValid, setInsuranceIsValid] = useState(false);

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    try {
      const claimsData = await AsyncStorage.getItem('@collision_repair:claims');
      if (claimsData) {
        const claims: Claim[] = JSON.parse(claimsData);
        const foundClaim = claims.find((c) => c.id === id);
        if (foundClaim) {
          setClaim(foundClaim);
          // Set insurance data if available
          if (foundClaim.insuranceInfo) {
            setInsuranceData(foundClaim.insuranceInfo);
          }
          // Run fraud analysis
          const analysis = await analyzeFraud(foundClaim);
          setFraudScore(analysis.score);
        }
      }
    } catch (error) {
      console.error('Failed to load claim:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInsuranceChange = (data: InsuranceInfo, valid: boolean) => {
    setInsuranceData(data);
    setInsuranceIsValid(valid);
  };

  const handleSaveInsurance = async () => {
    if (!claim?.id || !insuranceData || !user) return;

    try {
      await updateInsuranceInfo(claim.id, insuranceData, user.id);
      setShowInsuranceEdit(false);
      // Reload claim to get updated data
      await loadClaim();
      Alert.alert('Success', 'Insurance information updated successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update insurance information.');
    }
  };

  const handleFlagInsurance = () => {
    if (!claim?.id) return;

    Alert.alert(
      'Flag Insurance Issue',
      'Select the type of issue to flag:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Missing Policy Info',
          onPress: async () => {
            await flagInsuranceInfo(claim.id, ['missing_policy']);
            await loadClaim();
            Alert.alert('Flagged', 'Insurance flagged for missing policy information.');
          },
        },
        {
          text: 'Unverified Provider',
          onPress: async () => {
            await flagInsuranceInfo(claim.id, ['unverified_provider']);
            await loadClaim();
            Alert.alert('Flagged', 'Insurance flagged for unverified provider.');
          },
        },
        {
          text: 'Suspicious Info',
          onPress: async () => {
            await flagInsuranceInfo(claim.id, ['suspicious']);
            await loadClaim();
            Alert.alert('Flagged', 'Insurance flagged as suspicious.');
          },
        },
      ]
    );
  };

  const updateClaimStatus = async (newStatus: 'approved' | 'rejected') => {
    if (!claim || !id) return;

    try {
      const claimsData = await AsyncStorage.getItem('@collision_repair:claims');
      if (!claimsData) return;

      const claims: Claim[] = JSON.parse(claimsData);
      const updatedClaims = claims.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              reviewedAt: new Date(),
              reviewedBy: user?.id,
              fraudScore: fraudScore || undefined,
            }
          : c
      );

      await AsyncStorage.setItem('@collision_repair:claims', JSON.stringify(updatedClaims));
    } catch (error) {
      console.error('Failed to update claim:', error);
      throw error;
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Claim',
      `Approve this $${claim?.estimate?.total.toFixed(2)} repair estimate?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await updateClaimStatus('approved');
              Alert.alert(
                'Claim Approved',
                'The body shop has been notified of approval.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to approve claim');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Claim',
      'Are you sure you want to reject this claim? The body shop will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await updateClaimStatus('rejected');
              Alert.alert(
                'Claim Rejected',
                'The body shop has been notified of rejection.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reject claim');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (isAnalyzing || !claim) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.tint} />
        <Text style={[styles.loadingText, { color: Colors.text }]}>
          Analyzing claim...
        </Text>
      </View>
    );
  }

  const autoApprovalThreshold = 5000;
  const canAutoApprove = claim.estimate && claim.estimate.total < autoApprovalThreshold;
  const riskLevel = fraudScore ? getFraudRiskLevel(fraudScore) : 'low';
  const riskColor = fraudScore ? getFraudRiskColor(fraudScore) : Colors.tint;

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.text }]}>Claim Review</Text>
          {claim.estimate && (
            <View style={[styles.amountCard, { backgroundColor: Colors.tint }]}>
              <Text style={styles.amountLabel}>Estimate Amount</Text>
              <Text style={styles.amountValue}>${claim.estimate.total.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Fraud Analysis */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Fraud Analysis</Text>
          <View style={[styles.fraudCard, { backgroundColor: Colors.cardBackground, borderLeftColor: riskColor }]}>
            <View style={styles.fraudHeader}>
              <View>
                <Text style={[styles.fraudLabel, { color: Colors.textSecondary }]}>Risk Score</Text>
                <Text style={[styles.fraudScore, { color: riskColor }]}>
                  {fraudScore}/100
                </Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
                <Text style={styles.riskBadgeText}>{riskLevel.toUpperCase()} RISK</Text>
              </View>
            </View>
            {riskLevel === 'low' && (
              <Text style={[styles.fraudNote, { color: Colors.textSecondary }]}>
                ✓ No major fraud indicators detected
              </Text>
            )}
            {riskLevel === 'medium' && (
              <Text style={[styles.fraudNote, { color: Colors.textSecondary }]}>
                ⚠️ Some risk indicators present - review recommended
              </Text>
            )}
            {riskLevel === 'high' && (
              <Text style={[styles.fraudNote, { color: Colors.textSecondary }]}>
                🚨 High risk - thorough investigation recommended
              </Text>
            )}
          </View>
        </View>

        {/* Auto-Approval Status */}
        {canAutoApprove ? (
          <View style={[styles.autoApproveCard, { backgroundColor: '#34c759' + '20', borderColor: '#34c759' }]}>
            <Text style={styles.autoApproveIcon}>✓</Text>
            <Text style={[styles.autoApproveText, { color: Colors.text }]}>
              Eligible for Auto-Approval
            </Text>
            <Text style={[styles.autoApproveNote, { color: Colors.textSecondary }]}>
              Under ${autoApprovalThreshold.toLocaleString()} threshold
            </Text>
          </View>
        ) : null}

        {/* Vehicle Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Vehicle</Text>
          <View style={[styles.infoCard, { backgroundColor: Colors.cardBackground }]}>
            <Text style={[styles.vehicleText, { color: Colors.text }]}>
              {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
            </Text>
            {claim.vehicle.vin && (
              <Text style={[styles.vinText, { color: Colors.textSecondary }]}>
                VIN: {claim.vehicle.vin}
              </Text>
            )}
          </View>
        </View>

        {/* Insurance Information */}
        <View style={styles.section}>
          <View style={styles.insuranceSectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>Insurance Information</Text>
            {!claim.insuranceInfoLockedAt && !showInsuranceEdit && (
              <TouchableOpacity
                onPress={() => setShowInsuranceEdit(true)}
                style={[styles.editButton, { borderColor: Colors.tint }]}>
                <Text style={[styles.editButtonText, { color: Colors.tint }]}>
                  {insuranceData ? 'Edit' : 'Add'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!showInsuranceEdit ? (
            insuranceData ? (
              <View>
                <View style={[styles.infoCard, { backgroundColor: Colors.cardBackground }]}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Status</Text>
                    <View
                      style={[
                        styles.insuranceStatusBadge,
                        {
                          backgroundColor:
                            claim.insuranceInfoStatus === 'complete'
                              ? '#34C759' + '20'
                              : claim.insuranceInfoStatus === 'flagged'
                              ? '#FF3B30' + '20'
                              : claim.insuranceInfoStatus === 'partial'
                              ? '#FF9500' + '20'
                              : '#8E8E93' + '20',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.insuranceStatusText,
                          {
                            color:
                              claim.insuranceInfoStatus === 'complete'
                                ? '#34C759'
                                : claim.insuranceInfoStatus === 'flagged'
                                ? '#FF3B30'
                                : claim.insuranceInfoStatus === 'partial'
                                ? '#FF9500'
                                : '#8E8E93',
                          },
                        ]}>
                        {claim.insuranceInfoStatus === 'complete'
                          ? 'Complete'
                          : claim.insuranceInfoStatus === 'flagged'
                          ? 'Flagged'
                          : claim.insuranceInfoStatus === 'partial'
                          ? 'Partial'
                          : 'None'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Provider</Text>
                    <Text style={[styles.infoValue, { color: Colors.text }]}>
                      {insuranceData.provider || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Policy #</Text>
                    <Text style={[styles.infoValue, { color: Colors.text }]}>
                      {insuranceData.policyNumber || 'N/A'}
                    </Text>
                  </View>
                  {insuranceData.agentName && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Agent</Text>
                        <Text style={[styles.infoValue, { color: Colors.text }]}>
                          {insuranceData.agentName}
                        </Text>
                      </View>
                    </>
                  )}
                  {claim.insuranceInfoLockedAt && (
                    <>
                      <View style={styles.divider} />
                      <Text style={[styles.lockedNote, { color: Colors.textSecondary }]}>
                        🔒 Locked after submission
                      </Text>
                    </>
                  )}
                </View>
                {!claim.insuranceInfoLockedAt && (
                  <TouchableOpacity
                    style={[styles.flagButton, { borderColor: '#FF3B30' }]}
                    onPress={handleFlagInsurance}>
                    <Text style={[styles.flagButtonText, { color: '#FF3B30' }]}>
                      🚩 Flag Insurance Issue
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={[styles.noInsuranceCard, { backgroundColor: Colors.cardBackground }]}>
                <Text style={[styles.noInsuranceText, { color: Colors.textSecondary }]}>
                  No insurance information provided
                </Text>
              </View>
            )
          ) : (
            <View>
              <InsuranceForm
                initialData={insuranceData || undefined}
                onChange={handleInsuranceChange}
                isLocked={!!claim.insuranceInfoLockedAt}
                showValidation={true}
                onFlagIssue={handleFlagInsurance}
              />
              <View style={styles.insuranceActions}>
                <TouchableOpacity
                  style={[styles.cancelInsuranceButton, { borderColor: Colors.textSecondary }]}
                  onPress={() => setShowInsuranceEdit(false)}>
                  <Text style={[styles.cancelInsuranceText, { color: Colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveInsuranceButton,
                    { backgroundColor: insuranceIsValid ? Colors.tint : Colors.textSecondary },
                  ]}
                  onPress={handleSaveInsurance}
                  disabled={!insuranceIsValid}>
                  <Text style={styles.saveInsuranceText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>
            Photos ({claim.photos.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photosContainer}>
              {claim.photos.slice(0, 4).map((photo) => (
                <Image
                  key={photo.id}
                  source={{ uri: photo.uri }}
                  style={styles.photoThumb}
                />
              ))}
              {claim.photos.length > 4 && (
                <View style={[styles.morePhotos, { backgroundColor: Colors.textSecondary + '30' }]}>
                  <Text style={[styles.morePhotosText, { color: Colors.text }]}>
                    +{claim.photos.length - 4}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Damage Assessment */}
        {claim.damageAssessment && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.text }]}>
              Damage Assessment
            </Text>
            <View style={[styles.infoCard, { backgroundColor: Colors.cardBackground }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>AI Confidence</Text>
                <Text style={[styles.infoValue, { color: Colors.text }]}>
                  {(claim.damageAssessment.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors.textSecondary }]}>Damaged Areas</Text>
                <Text style={[styles.infoValue, { color: Colors.text }]}>
                  {claim.damageAssessment.detectedDamages.length}
                </Text>
              </View>
            </View>

            <View style={styles.damageList}>
              {claim.damageAssessment.detectedDamages.map((damage) => (
                <View
                  key={damage.id}
                  style={[styles.damageItem, { backgroundColor: Colors.cardBackground }]}>
                  <Text style={[styles.damageArea, { color: Colors.text }]}>
                    {getAreaDisplayName(damage.area)}
                  </Text>
                  <View style={styles.damageDetails}>
                    <Text style={[styles.damageDetail, { color: Colors.textSecondary }]}>
                      {damage.severity} • {damage.repairType}
                    </Text>
                    <Text style={[styles.damageDetail, { color: Colors.textSecondary }]}>
                      {damage.affectedParts.length} parts
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: Colors.background, borderTopColor: Colors.textSecondary + '30' }]}>
        <Button
          title="Reject"
          onPress={handleReject}
          variant="destructive"
          disabled={isProcessing}
          style={styles.footerButton}
        />
        <Button
          title="Approve"
          onPress={handleApprove}
          variant="success"
          disabled={isProcessing}
          loading={isProcessing}
          style={styles.footerButton}
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
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  amountCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  amountLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  amountValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  fraudCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  fraudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fraudLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  fraudScore: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  fraudNote: {
    fontSize: 14,
  },
  autoApproveCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 24,
  },
  autoApproveIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  autoApproveText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  autoApproveNote: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vinText: {
    fontSize: 14,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoThumb: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  morePhotos: {
    width: 120,
    height: 90,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  damageList: {
    gap: 8,
    marginTop: 8,
  },
  damageItem: {
    padding: 12,
    borderRadius: 8,
  },
  damageArea: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  damageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  damageDetail: {
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  insuranceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  insuranceStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  insuranceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lockedNote: {
    fontSize: 14,
    marginTop: 8,
  },
  flagButton: {
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  flagButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noInsuranceCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  noInsuranceText: {
    fontSize: 16,
  },
  insuranceActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelInsuranceButton: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelInsuranceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveInsuranceButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveInsuranceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
