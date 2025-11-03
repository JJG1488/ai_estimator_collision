import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { Claim } from '@/types';

export default function PendingClaimsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const claimsData = await AsyncStorage.getItem('@collision_repair:claims');
      if (claimsData) {
        const allClaims: Claim[] = JSON.parse(claimsData);
        // Filter pending claims only
        const pending = allClaims.filter((c) => c.status === 'pending_review');
        setClaims(pending);
      }
    } catch (error) {
      console.error('Failed to load claims:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClaims();
    setRefreshing(false);
  };

  const handleClaimPress = (claim: Claim) => {
    router.push(`/(adjuster)/claim/${claim.id}/review`);
  };

  const autoApprovalThreshold = 5000;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: Colors.text }]}>
          Pending Claims
        </Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
          {claims.length} {claims.length === 1 ? 'claim' : 'claims'} awaiting review
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: '#007aff' + '15' }]}>
          <Text style={[styles.statValue, { color: '#007aff' }]}>{claims.length}</Text>
          <Text style={[styles.statLabel, { color: Colors.text }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#34c759' + '15' }]}>
          <Text style={[styles.statValue, { color: '#34c759' }]}>
            {claims.filter((c) => c.estimate && c.estimate.total < autoApprovalThreshold).length}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.text }]}>Auto-Approve</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#ff3b30' + '15' }]}>
          <Text style={[styles.statValue, { color: '#ff3b30' }]}>
            {claims.filter((c) => (c.fraudScore || 0) > 70).length}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.text }]}>High Risk</Text>
        </View>
      </View>

      <View style={styles.section}>
        {claims.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: Colors.border }]}>
            <Text style={[styles.emptyIcon, { color: Colors.textSecondary }]}>✓</Text>
            <Text style={[styles.emptyText, { color: Colors.text }]}>
              No pending claims
            </Text>
            <Text style={[styles.emptySubtext, { color: Colors.textSecondary }]}>
              All caught up! New claims will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.claimsList}>
            {claims.map((claim) => {
              const canAutoApprove = claim.estimate && claim.estimate.total < autoApprovalThreshold;
              return (
                <TouchableOpacity
                  key={claim.id}
                  style={[styles.claimCard, { backgroundColor: Colors.cardBackground }]}
                  onPress={() => handleClaimPress(claim)}>
                  <View style={styles.claimHeader}>
                    <View style={styles.claimInfo}>
                      <Text style={[styles.claimVehicle, { color: Colors.text }]}>
                        {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
                      </Text>
                      {canAutoApprove && (
                        <View style={[styles.badge, { backgroundColor: '#34c759' }]}>
                          <Text style={styles.badgeText}>Auto-Approve Eligible</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.claimDetails}>
                    <View style={styles.detail}>
                      <Text style={[styles.detailLabel, { color: Colors.textSecondary }]}>Submitted</Text>
                      <Text style={[styles.detailValue, { color: Colors.text }]}>
                        {claim.submittedAt
                          ? new Date(claim.submittedAt).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </View>

                    {claim.estimate && (
                      <View style={styles.detail}>
                        <Text style={[styles.detailLabel, { color: Colors.textSecondary }]}>Amount</Text>
                        <Text style={[styles.detailValue, { color: Colors.tint }]}>
                          ${claim.estimate.total.toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {claim.damageAssessment && (
                      <View style={styles.detail}>
                        <Text style={[styles.detailLabel, { color: Colors.textSecondary }]}>Damage</Text>
                        <Text style={[styles.detailValue, { color: Colors.text }]}>
                          {claim.damageAssessment.detectedDamages.length} areas
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.claimFooter}>
                    <Text style={[styles.reviewPrompt, { color: Colors.tint }]}>
                      Tap to review →
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyState: {
    padding: 48,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  claimsList: {
    gap: 12,
  },
  claimCard: {
    padding: 16,
    borderRadius: 12,
  },
  claimHeader: {
    marginBottom: 12,
  },
  claimInfo: {
    gap: 8,
  },
  claimVehicle: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  claimDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  claimFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  reviewPrompt: {
    fontSize: 14,
    fontWeight: '600',
  },
});
