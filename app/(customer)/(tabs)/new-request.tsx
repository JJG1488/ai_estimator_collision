import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClaim } from '@/contexts/claim-context';
import { useAuth } from '@/contexts/auth-context';

export default function NewRequestScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { createClaim, currentClaim } = useClaim();
  const { user } = useAuth();

  const handleStartNewRequest = async () => {
    if (currentClaim && currentClaim.status === 'draft') {
      Alert.alert(
        'Continue Existing Request?',
        'You have an incomplete repair request. Would you like to continue it or start a new one?',
        [
          { text: 'Continue', onPress: () => navigateToVehicleInfo() },
          {
            text: 'Start New',
            style: 'destructive',
            onPress: async () => {
              await createNewClaim();
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      await createNewClaim();
    }
  };

  const createNewClaim = async () => {
    await createClaim();
    navigateToVehicleInfo();
  };

  const navigateToVehicleInfo = () => {
    // For now, show alert since we haven't created the flow screens yet
    Alert.alert(
      'Feature Coming Soon',
      'The multi-step request form is being built. This will include:\n\n1. Vehicle Information\n2. Insurance Details\n3. Photo Upload\n4. Damage Assessment',
      [{ text: 'OK' }]
    );
    // TODO: Uncomment when screens are created
    // router.push('/(customer)/request/vehicle-info');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>New Repair Request</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Get an instant estimate for your vehicle damage
        </Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>How It Works</Text>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Vehicle Information</Text>
              <Text style={[styles.stepDescription, { color: colors.icon }]}>
                Enter your vehicle details (year, make, model, VIN)
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Insurance Details</Text>
              <Text style={[styles.stepDescription, { color: colors.icon }]}>
                Provide your insurance information (optional)
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Upload Photos</Text>
              <Text style={[styles.stepDescription, { color: colors.icon }]}>
                Take or upload photos of the damage (4-8 photos recommended)
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>AI Analysis</Text>
              <Text style={[styles.stepDescription, { color: colors.icon }]}>
                Our AI analyzes the damage and generates an estimate
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Get Estimate</Text>
              <Text style={[styles.stepDescription, { color: colors.icon }]}>
                Receive a detailed repair estimate within minutes
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7' }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>What You'll Need</Text>
          <Text style={[styles.checklistItem, { color: colors.text }]}>✓ Vehicle information (VIN recommended)</Text>
          <Text style={[styles.checklistItem, { color: colors.text }]}>✓ Clear photos of damage from multiple angles</Text>
          <Text style={[styles.checklistItem, { color: colors.text }]}>✓ Insurance information (optional)</Text>
          <Text style={[styles.checklistItem, { color: colors.text }]}>✓ About 5-10 minutes of your time</Text>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.tint }]}
          onPress={handleStartNewRequest}>
          <Text style={styles.startButtonText}>Start New Request</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: '#007AFF15', borderColor: '#007AFF' }]}>
          <Text style={[styles.infoTitle, { color: '#007AFF' }]}>Free Estimates</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Get AI-powered repair estimates at no cost. No commitment required.
          </Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  checklistItem: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  startButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
