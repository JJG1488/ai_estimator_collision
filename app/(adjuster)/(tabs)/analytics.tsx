import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { Claim } from '@/types';

export default function AnalyticsScreen() {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const claimsData = await AsyncStorage.getItem('@collision_repair:claims');
      if (claimsData) {
        setClaims(JSON.parse(claimsData));
      }
    } catch (error) {
      console.error('Failed to load claims:', error);
    }
  };

  const totalClaims = claims.length;
  const approvedClaims = claims.filter((c) => c.status === 'approved').length;
  const rejectedClaims = claims.filter((c) => c.status === 'rejected').length;
  const pendingClaims = claims.filter((c) => c.status === 'pending_review').length;

  const totalPaid = claims
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + (c.estimate?.total || 0), 0);

  const avgClaimValue = totalClaims > 0
    ? claims.reduce((sum, c) => sum + (c.estimate?.total || 0), 0) / totalClaims
    : 0;

  const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;

  const revenueGenerated = totalClaims * 2; // $2 per claim processed

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.text }]}>Analytics</Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
          Platform performance metrics
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Claims Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#007aff' + '15' }]}>
            <Text style={[styles.statValue, { color: '#007aff' }]}>{totalClaims}</Text>
            <Text style={[styles.statLabel, { color: Colors.text }]}>Total Claims</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#34c759' + '15' }]}>
            <Text style={[styles.statValue, { color: '#34c759' }]}>{approvedClaims}</Text>
            <Text style={[styles.statLabel, { color: Colors.text }]}>Approved</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#ff3b30' + '15' }]}>
            <Text style={[styles.statValue, { color: '#ff3b30' }]}>{rejectedClaims}</Text>
            <Text style={[styles.statLabel, { color: Colors.text }]}>Rejected</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#ff9500' + '15' }]}>
            <Text style={[styles.statValue, { color: '#ff9500' }]}>{pendingClaims}</Text>
            <Text style={[styles.statLabel, { color: Colors.text }]}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Financial Metrics</Text>
        <View style={[styles.metricCard, { backgroundColor: Colors.cardBackground }]}>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Total Paid Out</Text>
            <Text style={[styles.metricValue, { color: Colors.text }]}>
              ${totalPaid.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Avg Claim Value</Text>
            <Text style={[styles.metricValue, { color: Colors.text }]}>
              ${avgClaimValue.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>API Revenue</Text>
            <Text style={[styles.metricValue, { color: Colors.tint }]}>
              ${revenueGenerated.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Performance</Text>
        <View style={[styles.metricCard, { backgroundColor: Colors.cardBackground }]}>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Approval Rate</Text>
            <Text style={[styles.metricValue, { color: Colors.text }]}>
              {approvalRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Claims Processed</Text>
            <Text style={[styles.metricValue, { color: Colors.text }]}>
              {approvedClaims + rejectedClaims}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: Colors.textSecondary }]}>Avg Processing Time</Text>
            <Text style={[styles.metricValue, { color: Colors.text }]}>
              2.3 hours
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.revenueCard, { backgroundColor: Colors.tint }]}>
        <Text style={styles.revenueLabel}>Estimated Monthly Revenue</Text>
        <Text style={styles.revenueValue}>${(revenueGenerated * 30).toFixed(2)}</Text>
        <Text style={styles.revenueNote}>Based on $2 per claim processed</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
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
  metricCard: {
    padding: 16,
    borderRadius: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 16,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  revenueCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  revenueLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  revenueValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  revenueNote: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9,
  },
});
