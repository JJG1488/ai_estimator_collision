import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { Claim } from '@/types';
import { Button } from '@/components/buttons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { claims, isLoading, setActiveClaim } = useClaim();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const activeClaims = claims.filter((c) =>
    c.status === 'draft' || c.status === 'analyzing' || c.status === 'pending_review'
  );
  const recentClaims = claims.slice(0, 5);

  const onRefresh = async () => {
    setRefreshing(true);
    // In production, this would fetch fresh data from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleClaimPress = (claim: Claim) => {
    setActiveClaim(claim);
    if (claim.status === 'draft') {
      if (!claim.vehicle.make) {
        router.push(`/(body-shop)/claim/${claim.id}/vehicle-info`);
      } else if (claim.photos.length === 0) {
        router.push(`/(body-shop)/claim/${claim.id}/photo-capture`);
      } else {
        router.push(`/(body-shop)/claim/${claim.id}/damage-assessment`);
      }
    } else {
      router.push(`/(body-shop)/claim/${claim.id}/estimate`);
    }
  };

  const getStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'draft':
        return '#999';
      case 'analyzing':
        return '#ff9500';
      case 'pending_review':
        return '#007aff';
      case 'approved':
        return '#34c759';
      case 'rejected':
        return '#ff3b30';
      case 'supplement_needed':
        return '#ff9500';
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: Claim['status']) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'analyzing':
        return 'Analyzing';
      case 'pending_review':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'supplement_needed':
        return 'Supplement Needed';
      default:
        return status;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: Colors.text }]}>
          Welcome back, {user?.companyName}
        </Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
          {activeClaims.length} active {activeClaims.length === 1 ? 'claim' : 'claims'}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: Colors.tint + '15' }]}>
          <Text style={[styles.statValue, { color: Colors.tint }]}>{claims.length}</Text>
          <Text style={[styles.statLabel, { color: Colors.text }]}>Total Claims</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#34c759' + '15' }]}>
          <Text style={[styles.statValue, { color: '#34c759' }]}>
            {claims.filter((c) => c.status === 'approved').length}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.text }]}>Approved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#007aff' + '15' }]}>
          <Text style={[styles.statValue, { color: '#007aff' }]}>
            {activeClaims.length}
          </Text>
          <Text style={[styles.statLabel, { color: Colors.text }]}>In Progress</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Recent Claims</Text>
        {recentClaims.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: Colors.border }]}>
            <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
              No claims yet. Create your first claim to get started.
            </Text>
            <Button
              title="Create First Claim"
              onPress={() => router.push('/(body-shop)/(tabs)/new-claim')}
              variant="primary"
            />
          </View>
        ) : (
          <View style={styles.claimsList}>
            {recentClaims.map((claim) => (
              <TouchableOpacity
                key={claim.id}
                style={[styles.claimCard, { backgroundColor: '#f2f2f7' }]}
                onPress={() => handleClaimPress(claim)}>
                <View style={styles.claimHeader}>
                  <Text style={[styles.claimVehicle, { color: Colors.text }]}>
                    {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(claim.status)}</Text>
                  </View>
                </View>
                <Text style={[styles.claimDate, { color: Colors.textSecondary }]}>
                  Created {claim.createdAt.toLocaleDateString()}
                </Text>
                {claim.estimate && (
                  <Text style={[styles.claimEstimate, { color: Colors.tint }]}>
                    ${claim.estimate.total.toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  claimsList: {
    gap: 12,
  },
  claimCard: {
    padding: 16,
    borderRadius: 12,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  claimVehicle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  claimDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  claimEstimate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
