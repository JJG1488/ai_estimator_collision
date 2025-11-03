import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/buttons';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            // Navigate directly to welcome screen
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Company Name</Text>
            <Text style={[styles.value, { color: Colors.text }]}>{user?.companyName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Email</Text>
            <Text style={[styles.value, { color: Colors.text }]}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Account Type</Text>
            <View style={[styles.badge, { backgroundColor: Colors.tint }]}>
              <Text style={styles.badgeText}>Body Shop</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.label, { color: Colors.textSecondary }]}>Subscription</Text>
            <Text style={[styles.value, { color: Colors.text }]}>
              {user?.subscriptionTier?.toUpperCase() || 'BASIC'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>SUBSCRIPTION</Text>
        <View style={[styles.card, { backgroundColor: '#f2f2f7' }]}>
          <View style={styles.subscriptionInfo}>
            <Text style={[styles.subscriptionPrice, { color: Colors.text }]}>$500</Text>
            <Text style={[styles.subscriptionPeriod, { color: Colors.textSecondary }]}>per month</Text>
          </View>
          <View style={styles.features}>
            <Text style={[styles.feature, { color: Colors.text }]}>✓ Unlimited estimates</Text>
            <Text style={[styles.feature, { color: Colors.text }]}>✓ AI damage detection</Text>
            <Text style={[styles.feature, { color: Colors.text }]}>✓ Auto insurance approval</Text>
            <Text style={[styles.feature, { color: Colors.text }]}>✓ CCC ONE/Mitchell export</Text>
            <Text style={[styles.feature, { color: Colors.text }]}>✓ Priority support</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>PREFERENCES</Text>
        <TouchableOpacity style={[styles.card, { backgroundColor: '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: Colors.text }]}>Estimate Format</Text>
            <Text style={[styles.value, { color: Colors.textSecondary }]}>CCC ONE</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: Colors.text }]}>Notifications</Text>
            <Text style={[styles.value, { color: Colors.textSecondary }]}>Enabled</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="destructive"
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: Colors.textSecondary }]}>
          Collision Repair AI v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionPrice: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  subscriptionPeriod: {
    fontSize: 16,
  },
  features: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
