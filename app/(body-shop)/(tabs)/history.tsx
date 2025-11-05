import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useClaim } from '@/contexts/claim-context';
import { Claim } from '@/types';

export default function HistoryScreen() {
  // Colors now uses light mode only
  const { claims, setActiveClaim } = useClaim();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = claims.filter((claim) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      claim.vehicle.make?.toLowerCase().includes(query) ||
      claim.vehicle.model?.toLowerCase().includes(query) ||
      claim.vehicle.vin?.toLowerCase().includes(query) ||
      claim.status.toLowerCase().includes(query)
    );
  });

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
        return Colors.icon;
    }
  };

  const getStatusLabel = (status: Claim['status']) => {
    const labels = {
      draft: 'Draft',
      analyzing: 'Analyzing',
      pending_review: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      supplement_needed: 'Supplement Needed',
    };
    return labels[status] || status;
  };

  const handleClaimPress = (claim: Claim) => {
    setActiveClaim(claim);
    router.push(`/(body-shop)/claim/${claim.id}/estimate`);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: Colors.text, borderColor: Colors.icon, backgroundColor: '#f2f2f7' }]}
          placeholder="Search claims..."
          placeholderTextColor={Colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.list}>
        {filteredClaims.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: Colors.icon }]}>
              {searchQuery ? 'No claims found matching your search' : 'No claims yet'}
            </Text>
          </View>
        ) : (
          filteredClaims.map((claim) => (
            <TouchableOpacity
              key={claim.id}
              style={[styles.claimCard, { backgroundColor: '#f2f2f7' }]}
              onPress={() => handleClaimPress(claim)}>
              <View style={styles.claimHeader}>
                <View style={styles.claimInfo}>
                  <Text style={[styles.claimVehicle, { color: Colors.text }]}>
                    {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
                  </Text>
                  {claim.vehicle.vin && (
                    <Text style={[styles.claimVin, { color: Colors.icon }]}>
                      VIN: {claim.vehicle.vin}
                    </Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(claim.status)}</Text>
                </View>
              </View>

              <View style={styles.claimDetails}>
                <View style={styles.claimDetail}>
                  <Text style={[styles.detailLabel, { color: Colors.icon }]}>Created</Text>
                  <Text style={[styles.detailValue, { color: Colors.text }]}>
                    {claim.createdAt.toLocaleDateString()}
                  </Text>
                </View>

                {claim.submittedAt && (
                  <View style={styles.claimDetail}>
                    <Text style={[styles.detailLabel, { color: Colors.icon }]}>Submitted</Text>
                    <Text style={[styles.detailValue, { color: Colors.text }]}>
                      {claim.submittedAt.toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {claim.estimate && (
                  <View style={styles.claimDetail}>
                    <Text style={[styles.detailLabel, { color: Colors.icon }]}>Estimate</Text>
                    <Text style={[styles.detailValue, { color: Colors.tint }]}>
                      ${claim.estimate.total.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {claim.damageAssessment && (
                <View style={styles.damageInfo}>
                  <Text style={[styles.damageText, { color: Colors.icon }]}>
                    {claim.damageAssessment.detectedDamages.length} damaged{' '}
                    {claim.damageAssessment.detectedDamages.length === 1 ? 'area' : 'areas'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  claimCard: {
    padding: 16,
    borderRadius: 12,
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
    marginRight: 12,
  },
  claimVehicle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  claimVin: {
    fontSize: 12,
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
  claimDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  claimDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  damageInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  damageText: {
    fontSize: 12,
  },
});
