import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { Claim } from '@/types';

export default function CustomerDashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { claims } = useClaim();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Filter claims for this customer
  const customerClaims = claims.filter(claim => claim.customerId === user?.id);
  const activeClaims = customerClaims.filter(claim =>
    claim.status !== 'approved' && claim.status !== 'rejected'
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: Claim['status']) => {
    switch (status) {
      case 'approved':
        return '#34C759';
      case 'rejected':
        return '#FF3B30';
      case 'pending_review':
        return '#007AFF';
      case 'analyzing':
        return '#FF9500';
      case 'draft':
        return '#8E8E93';
      default:
        return colors.icon;
    }
  };

  const getStatusText = (status: Claim['status']) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'analyzing':
        return 'Analyzing';
      case 'pending_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'supplement_needed':
        return 'Info Needed';
      default:
        return status;
    }
  };

  const renderClaimCard = (claim: Claim) => (
    <TouchableOpacity
      key={claim.id}
      style={[styles.claimCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}
      onPress={() => {
        // Navigate to claim status screen
        // router.push(`/(customer)/request/${claim.id}/status`);
      }}>
      <View style={styles.claimHeader}>
        <View style={styles.claimInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
          </Text>
          <Text style={[styles.claimDate, { color: colors.icon }]}>
            {claim.createdAt.toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(claim.status) }]}>
            {getStatusText(claim.status)}
          </Text>
        </View>
      </View>

      {claim.assignedBodyShopName && (
        <View style={styles.bodyShopInfo}>
          <Text style={[styles.bodyShopLabel, { color: colors.icon }]}>Body Shop:</Text>
          <Text style={[styles.bodyShopName, { color: colors.text }]}>
            {claim.assignedBodyShopName}
          </Text>
        </View>
      )}

      {claim.estimate && (
        <View style={styles.estimateInfo}>
          <Text style={[styles.estimateLabel, { color: colors.icon }]}>Estimate:</Text>
          <Text style={[styles.estimateAmount, { color: colors.text }]}>
            ${claim.estimate.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
      }>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Welcome, {user?.companyName}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Track your repair estimates
        </Text>
      </View>

      {activeClaims.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Active Claims</Text>
          <Text style={[styles.emptyStateText, { color: colors.icon }]}>
            Start a new repair request to get an estimate
          </Text>
          <TouchableOpacity
            style={[styles.newRequestButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(customer)/(tabs)/new-request')}>
            <Text style={styles.newRequestButtonText}>New Repair Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeClaims.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Claims</Text>
          {activeClaims.map(renderClaimCard)}
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}
          onPress={() => router.push('/(customer)/(tabs)/new-request')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.tint + '20' }]}>
            <Text style={[styles.actionIconText, { color: colors.tint }]}>+</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>New Repair Request</Text>
            <Text style={[styles.actionDescription, { color: colors.icon }]}>
              Upload photos and get an instant estimate
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}
          onPress={() => router.push('/(customer)/(tabs)/history')}>
          <View style={[styles.actionIcon, { backgroundColor: colors.tint + '20' }]}>
            <Text style={[styles.actionIconText, { color: colors.tint }]}>⏱</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>View History</Text>
            <Text style={[styles.actionDescription, { color: colors.icon }]}>
              See all past repair estimates
            </Text>
          </View>
        </TouchableOpacity>
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
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  newRequestButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newRequestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  claimCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  claimInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  claimDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bodyShopInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bodyShopLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  bodyShopName: {
    fontSize: 14,
    fontWeight: '500',
  },
  estimateInfo: {
    flexDirection: 'row',
  },
  estimateLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  estimateAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    padding: 16,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
  },
});
