import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function RoleSelectionScreen() {
  const router = useRouter();
  // Colors now uses light mode only

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors.text }]}>Who are you?</Text>
        <Text style={[styles.subtitle, { color: Colors.icon }]}>
          Select your account type to continue
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={[styles.optionCard, { borderColor: Colors.tint }]}
            onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.optionTitle, { color: Colors.text }]}>🔧 Body Shop</Text>
            <Text style={[styles.optionDescription, { color: Colors.icon }]}>
              Generate AI-powered estimates and get instant insurance approvals
            </Text>
            <Text style={[styles.optionPrice, { color: Colors.tint }]}>$500/month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { borderColor: Colors.tint }]}
            onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.optionTitle, { color: Colors.text }]}>🛡️ Insurance Adjuster</Text>
            <Text style={[styles.optionDescription, { color: Colors.icon }]}>
              Review claims with fraud detection and automated approval workflows
            </Text>
            <Text style={[styles.optionPrice, { color: Colors.tint }]}>$2 per claim</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={[styles.loginLink, { color: Colors.tint }]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  options: {
    gap: 16,
  },
  optionCard: {
    padding: 24,
    borderWidth: 2,
    borderRadius: 16,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  optionPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
    fontWeight: '600',
  },
});
