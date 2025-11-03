import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { Claim } from '@/types';

export default function CustomerHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { claims } = useClaim();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');

  // Filter claims for this customer
  const customerClaims = claims.filter(claim => claim.customerId === user?.id);

  const filteredClaims = customerClaims.filter(claim => {
    if (filter === 'all') return true;
    return claim.status === filter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
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
    <View
      key={claim.id}
      style={[styles.claimCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
      <View style={styles.claimHeader}>
        <View style={styles.claimInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
          </Text>
          <Text style={[styles.claimDate, { color: colors.icon }]}>
            Submitted: {claim.createdAt.toLocaleDateString()}
          </Text>
          {claim.reviewedAt && (
            <Text style={[styles.claimDate, { color: colors.icon }]}>
              Reviewed: {claim.reviewedAt.toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(claim.status) }]}>
            {getStatusText(claim.status)}
          </Text>
        </View>
      </View>

      {claim.assignedBodyShopName && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.icon }]}>Body Shop:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {claim.assignedBodyShopName}
          </Text>
        </View>
      )}

      {claim.estimate && (
        <>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>Estimate Total:</Text>
            <Text style={[styles.detailValue, { color: colors.text, fontWeight: '600' }]}>
              ${claim.estimate.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {claim.insuranceInfo && claim.insuranceInfo.deductible && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.icon }]}>Your Deductible:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                ${claim.insuranceInfo.deductible.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          )}
        </>
      )}

      {claim.photos && claim.photos.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.icon }]}>Photos:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {claim.photos.length} uploaded
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: colors.tint },
            filter !== 'all' && { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' },
          ]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' ? { color: '#fff' } : { color: colors.text },
            ]}>
            All ({customerClaims.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'approved' && { backgroundColor: colors.tint },
            filter !== 'approved' && { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' },
          ]}
          onPress={() => setFilter('approved')}>
          <Text
            style={[
              styles.filterButtonText,
              filter === 'approved' ? { color: '#fff' } : { color: colors.text },
            ]}>
            Approved ({customerClaims.filter(c => c.status === 'approved').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'rejected' && { backgroundColor: colors.tint },
            filter !== 'rejected' && { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' },
          ]}
          onPress={() => setFilter('rejected')}>
          <Text
            style={[
              styles.filterButtonText,
              filter === 'rejected' ? { color: '#fff' } : { color: colors.text },
            ]}>
            Rejected ({customerClaims.filter(c => c.status === 'rejected').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }>
        {filteredClaims.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.icon }]}>
              {filter === 'all'
                ? 'No claims yet'
                : `No ${filter} claims`}
            </Text>
          </View>
        )}

        {filteredClaims.map(renderClaimCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
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
    fontSize: 13,
    marginTop: 2,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
  },
});
