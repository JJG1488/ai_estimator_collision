import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';

export default function CustomerSettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.icon }]}>Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.companyName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.icon }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.icon }]}>Account Type</Text>
            <View style={[styles.badge, { backgroundColor: colors.tint }]}>
              <Text style={styles.badgeText}>Customer</Text>
            </View>
          </View>
          {user?.phone && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.icon }]}>Phone</Text>
                <Text style={[styles.value, { color: colors.text }]}>{user.phone}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>SERVICES</Text>
        <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceTitle, { color: colors.text }]}>Free Estimates</Text>
            <Text style={[styles.serviceDescription, { color: colors.icon }]}>
              Get unlimited AI-powered repair estimates at no cost
            </Text>
          </View>
          <View style={styles.features}>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Instant damage assessment</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Accurate repair pricing</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Insurance integration</Text>
            <Text style={[styles.feature, { color: colors.text }]}>✓ Multiple body shop quotes</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>PREFERENCES</Text>
        <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Notifications</Text>
            <Text style={[styles.value, { color: colors.icon }]}>Enabled</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Email Updates</Text>
            <Text style={[styles.value, { color: colors.icon }]}>Enabled</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.icon }]}>SUPPORT</Text>
        <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Help Center</Text>
            <Text style={[styles.value, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Contact Support</Text>
            <Text style={[styles.value, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Terms of Service</Text>
            <Text style={[styles.value, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.value, { color: colors.icon }]}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#ff3b30' }]}
          onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.icon }]}>
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
  serviceInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  features: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
  },
  signOutButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
