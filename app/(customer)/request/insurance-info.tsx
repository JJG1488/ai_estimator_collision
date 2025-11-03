import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { useClaim } from '@/contexts/claim-context';
import { InsuranceForm } from '@/components/insurance-form';
import { InsuranceInfo } from '@/types';

export default function CustomerInsuranceInfoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();
  const { currentClaim, updateInsuranceInfo } = useClaim();

  const [insuranceData, setInsuranceData] = useState<InsuranceInfo>(
    currentClaim?.insuranceInfo || {
      provider: '',
      policyNumber: '',
      claimNumber: '',
      agentName: '',
      agentPhone: '',
      agentEmail: '',
      deductible: undefined,
    }
  );
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInsuranceChange = (data: InsuranceInfo, valid: boolean) => {
    setInsuranceData(data);
    setIsValid(valid);
  };

  const handleSave = async () => {
    if (!currentClaim || !user) return;

    setIsSaving(true);
    try {
      await updateInsuranceInfo(currentClaim.id, insuranceData, user.id);

      Alert.alert(
        'Success',
        'Insurance information saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save insurance information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Insurance Info?',
      'You can add insurance information later before submitting your claim.\n\nAre you sure you want to skip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip for Now',
          style: 'default',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (!currentClaim) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No active claim found
        </Text>
      </View>
    );
  }

  const isLocked = !!currentClaim.insuranceInfoLockedAt;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Insurance Information</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            {isLocked
              ? 'Insurance information is locked after submission'
              : 'Provide your insurance details (optional but recommended)'}
          </Text>
        </View>

        {!isLocked && (
          <View style={[styles.infoCard, { backgroundColor: '#007AFF' + '20', borderColor: '#007AFF' }]}>
            <Text style={[styles.infoTitle, { color: '#007AFF' }]}>💡 Why provide insurance info?</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              Adding insurance details speeds up the approval process and ensures accurate claim processing.
              You can skip this step and add it later if needed.
            </Text>
          </View>
        )}

        <InsuranceForm
          initialData={insuranceData}
          onChange={handleInsuranceChange}
          isLocked={isLocked}
          showValidation={true}
        />

        {!isLocked && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: isValid ? colors.tint : colors.icon },
              ]}
              onPress={handleSave}
              disabled={isSaving || !isValid}>
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Insurance Info'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.skipButton, { borderColor: colors.icon }]}
              onPress={handleSkip}
              disabled={isSaving}>
              <Text style={[styles.skipButtonText, { color: colors.icon }]}>
                Skip for Now
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLocked && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.tint }]}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
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
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
