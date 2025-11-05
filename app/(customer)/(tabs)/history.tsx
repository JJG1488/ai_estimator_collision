import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { Claim } from '@/types';
import { formatCurrency } from '@/utils/aiPreEstimate';

export default function CustomerHistoryScreen() {
  // Colors now uses light mode only
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
        return Colors.icon;
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
      style={[styles.claimCard, { backgroundColor: '#f2f2f7' }]}>
      <View style={styles.claimHeader}>
        <View style={styles.claimInfo}>
          <Text style={[styles.vehicleName, { color: Colors.text }]}>
            {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
          </Text>
          <Text style={[styles.claimDate, { color: Colors.icon }]}>
            Submitted: {claim.createdAt.toLocaleDateString()}
          </Text>
          {claim.reviewedAt && (
            <Text style={[styles.claimDate, { color: Colors.icon }]}>
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
          <Text style={[styles.detailLabel, { color: Colors.icon }]}>Body Shop:</Text>
          <Text style={[styles.detailValue, { color: Colors.text }]}>
            {claim.assignedBodyShopName}
          </Text>
        </View>
      )}

      {claim.preEstimate && !claim.estimate && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: Colors.icon }]}>AI Pre-Estimate:</Text>
          <Text style={[styles.detailValue, { color: '#FF9500', fontWeight: '600' }]}>
            {formatCurrency(claim.preEstimate.range.typical)}
          </Text>
        </View>
      )}

      {claim.estimate && (
        <>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors.icon }]}>Final Estimate:</Text>
            <Text style={[styles.detailValue, { color: Colors.tint, fontWeight: '600' }]}>
              ${claim.estimate.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {claim.insuranceInfo && claim.insuranceInfo.deductible && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors.icon }]}>Your Deductible:</Text>
              <Text style={[styles.detailValue, { color: Colors.text }]}>
                ${claim.insuranceInfo.deductible.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          )}
        </>
      )}

      {claim.photos && claim.photos.length > 0 && (
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: Colors.icon }]}>Photos:</Text>
          <Text style={[styles.detailValue, { color: Colors.text }]}>
            {claim.photos.length} uploaded
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: Colors.tint },
            filter !== 'all' && { backgroundColor: '#f2f2f7' },
          ]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' ? { color: '#fff' } : { color: Colors.text },
            ]}>
            All ({customerClaims.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'approved' && { backgroundColor: Colors.tint },
            filter !== 'approved' && { backgroundColor: '#f2f2f7' },
          ]}
          onPress={() => setFilter('approved')}>
          <Text
            style={[
              styles.filterButtonText,
              filter === 'approved' ? { color: '#fff' } : { color: Colors.text },
            ]}>
            Approved ({customerClaims.filter(c => c.status === 'approved').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'rejected' && { backgroundColor: Colors.tint },
            filter !== 'rejected' && { backgroundColor: '#f2f2f7' },
          ]}
          onPress={() => setFilter('rejected')}>
          <Text
            style={[
              styles.filterButtonText,
              filter === 'rejected' ? { color: '#fff' } : { color: Colors.text },
            ]}>
            Rejected ({customerClaims.filter(c => c.status === 'rejected').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.tint} />
        }>
        {filteredClaims.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: Colors.icon }]}>
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
