import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { Claim } from '@/types';

export default function ApprovedClaimsScreen() {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const claimsData = await AsyncStorage.getItem('@collision_repair:claims');
      if (claimsData) {
        const allClaims: Claim[] = JSON.parse(claimsData);
        const approved = allClaims.filter((c) => c.status === 'approved');
        setClaims(approved);
      }
    } catch (error) {
      console.error('Failed to load claims:', error);
    }
  };

  const totalApproved = claims.reduce((sum, c) => sum + (c.estimate?.total || 0), 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Approved Claims</Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
          {claims.length} approved • ${totalApproved.toFixed(2)} total
        </Text>
      </View>

      {claims.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: Colors.textSecondary }]}>
            No approved claims yet
          </Text>
        </View>
      ) : (
        <View style={styles.claimsList}>
          {claims.map((claim) => (
            <View
              key={claim.id}
              style={[styles.claimCard, { backgroundColor: Colors.cardBackground }]}>
              <View style={[styles.statusIndicator, { backgroundColor: '#34c759' }]} />
              <Text style={[styles.claimVehicle, { color: Colors.text }]}>
                {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
              </Text>
              <View style={styles.claimDetails}>
                <Text style={[styles.detailText, { color: Colors.textSecondary }]}>
                  Approved: {claim.reviewedAt ? new Date(claim.reviewedAt).toLocaleDateString() : 'N/A'}
                </Text>
                {claim.estimate && (
                  <Text style={[styles.amountText, { color: Colors.tint }]}>
                    ${claim.estimate.total.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  claimsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  claimCard: {
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  claimVehicle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  claimDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
