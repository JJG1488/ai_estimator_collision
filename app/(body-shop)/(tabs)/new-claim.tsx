import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useClaim } from '@/contexts/claim-context';
import { Button } from '@/components/buttons';

export default function NewClaimScreen() {
  const { createClaim } = useClaim();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClaim = async () => {
    setIsCreating(true);
    try {
      const claim = await createClaim();
      router.push(`/(body-shop)/claim/${claim.id}/vehicle-info`);
    } catch (error) {
      alert('Failed to create claim. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>📸</Text>
          <Text style={[styles.title, { color: Colors.text }]}>Start New Estimate</Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Our AI will analyze damage photos and generate an insurance-ready estimate in minutes
          </Text>
        </View>

        <View style={styles.steps}>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.tint }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: Colors.text }]}>Vehicle Information</Text>
              <Text style={[styles.stepDescription, { color: Colors.textSecondary }]}>
                Enter basic details about the vehicle
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.tint }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: Colors.text }]}>Capture Photos</Text>
              <Text style={[styles.stepDescription, { color: Colors.textSecondary }]}>
                Take photos from multiple angles (8 required)
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.tint }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: Colors.text }]}>AI Analysis</Text>
              <Text style={[styles.stepDescription, { color: Colors.textSecondary }]}>
                Our AI detects damage and identifies parts
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: Colors.tint }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: Colors.text }]}>Review & Submit</Text>
              <Text style={[styles.stepDescription, { color: Colors.textSecondary }]}>
                Verify estimate and submit to insurance
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="Get Started"
          onPress={handleCreateClaim}
          variant="primary"
          loading={isCreating}
          disabled={isCreating}
        />

        <View style={[styles.infoBox, { backgroundColor: '#f2f2f7' }]}>
          <Text style={[styles.infoTitle, { color: Colors.text }]}>⚡ Fast & Accurate</Text>
          <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
            • Average processing time: 2-3 minutes{'\n'}
            • 95% approval rate for claims under $5,000{'\n'}
            • Automatic CCC ONE/Mitchell formatting
          </Text>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  steps: {
    marginBottom: 32,
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
    fontWeight: 'bold',
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
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
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
