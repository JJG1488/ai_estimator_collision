import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🚗💥</Text>
          <Text style={[styles.title, { color: colors.text }]}>Collision Repair AI</Text>
          <Text style={[styles.tagline, { color: colors.icon }]}>
            Snap photos, get instant estimates
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📸</Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>AI Photo Analysis</Text>
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Take photos, our AI detects damage instantly
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>💰</Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Instant Estimates</Text>
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Get insurance-ready repair costs in minutes
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>⚡</Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>Auto-Approval</Text>
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Claims under $5K approved automatically
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#007AFF' }]}
            onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.tint }]}
            onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demo}>
          <Text style={[styles.demoTitle, { color: colors.text }]}>Demo Accounts:</Text>
          <Text style={[styles.demoText, { color: colors.icon }]}>
            Body Shop: shop@example.com
          </Text>
          <Text style={[styles.demoText, { color: colors.icon }]}>
            Adjuster: adjuster@example.com
          </Text>
          <Text style={[styles.demoText, { color: colors.icon }]}>Password: anything</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    textAlign: 'center',
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featureEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  demo: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
